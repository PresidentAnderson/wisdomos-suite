import { SupabaseClient } from '@supabase/supabase-js';
import * as CryptoJS from 'crypto-js';
import {
  LegacyVault,
  VaultDocument,
  TrusteeAssignment,
  SuccessionPlan,
  ExportBundle,
  LegacyVaultSchema,
  VaultDocumentSchema,
} from './types';

export class LegacyVaultService {
  constructor(private supabase: SupabaseClient) {}

  private generateEncryptionKey(): string {
    return CryptoJS.lib.WordArray.random(256 / 8).toString();
  }

  private encryptData(data: string, key: string): string {
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  private decryptData(encryptedData: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async createVault(userId: string, name: string, description?: string) {
    const vault: LegacyVault = {
      id: crypto.randomUUID(),
      userId,
      name,
      description,
      documents: [],
      trustees: [],
      encryptionKey: this.generateEncryptionKey(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const validated = LegacyVaultSchema.parse(vault);

    // Store encryption key separately in secure storage
    await this.storeEncryptionKey(vault.id, vault.encryptionKey);

    // Don't store the actual encryption key in the database
    const { encryptionKey, ...vaultData } = validated;

    const { data, error } = await this.supabase
      .from('legacy_vaults')
      .insert(vaultData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async storeEncryptionKey(vaultId: string, key: string) {
    // In production, use a proper key management service
    // For now, store encrypted with user's password-derived key
    const { data, error } = await this.supabase
      .from('vault_keys')
      .insert({
        vaultId,
        encryptedKey: this.encryptData(key, process.env.MASTER_ENCRYPTION_KEY!),
      });

    if (error) throw error;
    return data;
  }

  async uploadDocument(
    vaultId: string,
    file: File,
    metadata: Partial<VaultDocument>
  ) {
    // Upload file to storage
    const fileName = `${vaultId}/${crypto.randomUUID()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from('legacy-vault')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get the vault's encryption key
    const encryptionKey = await this.getVaultEncryptionKey(vaultId);

    // Create document record
    const document: VaultDocument = {
      id: crypto.randomUUID(),
      userId: metadata.userId!,
      title: metadata.title || file.name,
      description: metadata.description,
      type: metadata.type || 'other',
      fileUrl: uploadData.path,
      fileSize: file.size,
      mimeType: file.type,
      tags: metadata.tags,
      metadata: metadata.metadata,
      isEncrypted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Encrypt sensitive data
    if (encryptionKey) {
      document.encryptedUrl = this.encryptData(document.fileUrl, encryptionKey);
    }

    const validated = VaultDocumentSchema.parse(document);

    // Add document to vault
    const { data: vault, error: vaultError } = await this.supabase
      .from('legacy_vaults')
      .select('documents')
      .eq('id', vaultId)
      .single();

    if (vaultError) throw vaultError;

    const updatedDocuments = [...(vault.documents || []), validated];

    const { data, error } = await this.supabase
      .from('legacy_vaults')
      .update({
        documents: updatedDocuments,
        updatedAt: new Date(),
      })
      .eq('id', vaultId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async getVaultEncryptionKey(vaultId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('vault_keys')
      .select('encryptedKey')
      .eq('vaultId', vaultId)
      .single();

    if (error || !data) return null;

    return this.decryptData(
      data.encryptedKey,
      process.env.MASTER_ENCRYPTION_KEY!
    );
  }

  async assignTrustee(
    vaultId: string,
    documentId: string,
    trusteeUserId: string,
    assignment: Partial<TrusteeAssignment>
  ) {
    const trusteeAssignment: TrusteeAssignment = {
      id: crypto.randomUUID(),
      documentId,
      trusteeUserId,
      accessLevel: assignment.accessLevel || 'view_only',
      activationCondition: assignment.activationCondition || 'on_death',
      customCondition: assignment.customCondition,
      expiresAt: assignment.expiresAt,
      notes: assignment.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Generate access key for trustee
    const accessKey = this.generateEncryptionKey();
    trusteeAssignment.accessKey = this.encryptData(
      accessKey,
      process.env.MASTER_ENCRYPTION_KEY!
    );

    // Store trustee assignment
    const { data: vault, error: vaultError } = await this.supabase
      .from('legacy_vaults')
      .select('trustees')
      .eq('id', vaultId)
      .single();

    if (vaultError) throw vaultError;

    const updatedTrustees = [...(vault.trustees || []), trusteeAssignment];

    const { data, error } = await this.supabase
      .from('legacy_vaults')
      .update({
        trustees: updatedTrustees,
        updatedAt: new Date(),
      })
      .eq('id', vaultId)
      .select()
      .single();

    if (error) throw error;

    // Notify trustee
    await this.notifyTrustee(trusteeUserId, vaultId, documentId, assignment);

    return data;
  }

  private async notifyTrustee(
    trusteeUserId: string,
    vaultId: string,
    documentId: string,
    assignment: Partial<TrusteeAssignment>
  ) {
    // Send notification to trustee about their assignment
    const { error } = await this.supabase
      .from('notifications')
      .insert({
        userId: trusteeUserId,
        type: 'trustee_assignment',
        title: 'You have been assigned as a trustee',
        message: `You have been granted ${assignment.accessLevel} access to a document in a legacy vault.`,
        metadata: {
          vaultId,
          documentId,
          activationCondition: assignment.activationCondition,
        },
        createdAt: new Date(),
      });

    if (error) console.error('Failed to notify trustee:', error);
  }

  async createSuccessionPlan(
    userId: string,
    vaultId: string,
    plan: Partial<SuccessionPlan>
  ) {
    const successionPlan: SuccessionPlan = {
      id: crypto.randomUUID(),
      userId,
      vaultId,
      instructions: plan.instructions || '',
      emergencyContacts: plan.emergencyContacts || [],
      legalDocuments: plan.legalDocuments,
      digitalAssets: plan.digitalAssets,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { data, error } = await this.supabase
      .from('succession_plans')
      .insert(successionPlan)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async exportVault(
    vaultId: string,
    format: 'pdf' | 'markdown' | 'notion' | 'json',
    options: {
      includeDocuments?: boolean;
      includeMetadata?: boolean;
      password?: string;
    } = {}
  ) {
    const { data: vault, error } = await this.supabase
      .from('legacy_vaults')
      .select('*')
      .eq('id', vaultId)
      .single();

    if (error) throw error;

    // Generate QR verification code
    const qrCode = crypto.randomUUID();

    let exportData: any;
    switch (format) {
      case 'json':
        exportData = JSON.stringify(vault, null, 2);
        break;
      case 'markdown':
        exportData = this.convertToMarkdown(vault);
        break;
      case 'pdf':
        // Would integrate with a PDF generation service
        exportData = await this.generatePDF(vault);
        break;
      case 'notion':
        exportData = this.convertToNotionFormat(vault);
        break;
    }

    // Encrypt if password provided
    if (options.password) {
      exportData = this.encryptData(exportData, options.password);
    }

    // Store export bundle
    const bundle: ExportBundle = {
      id: crypto.randomUUID(),
      userId: vault.userId,
      vaultId,
      format,
      includeDocuments: options.includeDocuments || false,
      includeMetadata: options.includeMetadata || false,
      encryptionPassword: options.password,
      qrVerificationCode: qrCode,
      downloadUrl: '', // Would be set after upload
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
    };

    // Upload export to storage
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from('exports')
      .upload(`${vaultId}/${bundle.id}.${format}`, exportData);

    if (uploadError) throw uploadError;

    bundle.downloadUrl = uploadData.path;

    const { data: exportRecord, error: exportError } = await this.supabase
      .from('export_bundles')
      .insert(bundle)
      .select()
      .single();

    if (exportError) throw exportError;
    return exportRecord;
  }

  private convertToMarkdown(vault: any): string {
    let markdown = `# Legacy Vault: ${vault.name}\\n\\n`;
    markdown += `${vault.description || ''}\\n\\n`;

    markdown += '## Documents\\n\\n';
    for (const doc of vault.documents) {
      markdown += `### ${doc.title}\\n`;
      markdown += `- Type: ${doc.type}\\n`;
      markdown += `- Size: ${doc.fileSize} bytes\\n`;
      if (doc.description) markdown += `- Description: ${doc.description}\\n`;
      if (doc.tags) markdown += `- Tags: ${doc.tags.join(', ')}\\n`;
      markdown += '\\n';
    }

    markdown += '## Trustees\\n\\n';
    for (const trustee of vault.trustees) {
      markdown += `- User: ${trustee.trusteeUserId}\\n`;
      markdown += `  - Access Level: ${trustee.accessLevel}\\n`;
      markdown += `  - Activation: ${trustee.activationCondition}\\n`;
      markdown += '\\n';
    }

    return markdown;
  }

  private async generatePDF(vault: any): Promise<Buffer> {
    // Placeholder - would integrate with PDF generation service
    const markdown = this.convertToMarkdown(vault);
    // Convert markdown to PDF using a service like Puppeteer
    return Buffer.from(markdown);
  }

  private convertToNotionFormat(vault: any): any {
    // Convert to Notion API format
    return {
      object: 'page',
      properties: {
        title: {
          title: [{ text: { content: vault.name } }],
        },
        description: {
          rich_text: [{ text: { content: vault.description || '' } }],
        },
      },
      children: [
        // Convert documents and trustees to Notion blocks
      ],
    };
  }
}