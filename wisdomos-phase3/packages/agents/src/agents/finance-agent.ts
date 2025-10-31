/**
 * Finance Agent
 * Ledger ingestion, profitability ratios, cashflow sufficiency, tax status
 * WRK/MUS/WRT/SPE × FIN board
 */

import { BaseAgent, AgentConfig } from '../core/base-agent';
import type { MessageEnvelope } from '../types/contracts';
import { EventTypes } from '../types/contracts';
import { v4 as uuidv4 } from 'uuid';

export interface Transaction {
  id: string;
  userId: string;
  areaId?: string;
  transactionDate: string;
  description: string;
  amount: number;
  currency: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  source: string;
  metadata?: Record<string, any>;
}

export interface ProfitabilityMetrics {
  userId: string;
  period: string;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number; // percentage
  byArea: Record<string, { income: number; expenses: number; profit: number }>;
}

export interface CashflowAnalysis {
  userId: string;
  period: string;
  openingBalance: number;
  closingBalance: number;
  inflows: number;
  outflows: number;
  sufficiency: 'surplus' | 'adequate' | 'tight' | 'deficit';
  daysOfRunway: number;
}

export class FinanceAgent extends BaseAgent {
  // FIN-specific area codes
  private readonly FIN_AREAS = ['WRK', 'MUS', 'WRT', 'SPE'];

  // Currency exchange rates (stub - in production, fetch from API)
  private readonly EXCHANGE_RATES: Record<string, number> = {
    CAD: 1.0,
    USD: 1.35,
    EUR: 1.45,
  };

  constructor(config: AgentConfig) {
    super({ ...config, agentType: 'FinanceAgent' });
  }

  /**
   * Handle incoming message
   */
  async handleMessage(message: MessageEnvelope): Promise<void> {
    await this.log('info', `FinanceAgent handling: ${message.task}`);

    // Handle ledger ingestion
    if (message.intent === 'execute' && message.task.includes('ingest_ledger')) {
      await this.ingestLedger(message.payload as { userId: string; source: string; data: any[]; format: 'csv' | 'json' | 'quickbooks' | 'xero' });
    }

    // Handle transaction import
    if (message.intent === 'execute' && message.task.includes('import_transactions')) {
      await this.importTransactions(message.payload as { userId: string; transactions: Transaction[] });
    }

    // Handle profitability calculation
    if (message.intent === 'execute' && message.task.includes('calculate_profitability')) {
      await this.calculateProfitability(message.payload as { userId: string; period: string });
    }

    // Handle cashflow analysis
    if (message.intent === 'execute' && message.task.includes('analyze_cashflow')) {
      await this.analyzeCashflow(message.payload as { userId: string; period: string });
    }

    // Listen for fulfilment rollups to update FIN dimensions
    if (message.payload.event_type === EventTypes.FULFILMENT_ROLLUP_COMPLETED) {
      await this.updateFinDimensions(message.payload);
    }
  }

  /**
   * Ingest ledger data (CSV, API, QuickBooks, etc.)
   */
  async ingestLedger(payload: {
    userId: string;
    source: string;
    data: any[];
    format: 'csv' | 'json' | 'quickbooks' | 'xero';
  }): Promise<{ imported: number; errors: number }> {
    const { userId, source, data, format } = payload;

    await this.log('info', `Ingesting ledger from ${source} for user ${userId}`, {
      format,
      count: data.length,
    });

    let imported = 0;
    let errors = 0;

    for (const row of data) {
      try {
        // Parse transaction based on format
        const transaction = await this.parseTransaction(row, format, userId, source);

        // Categorize transaction
        const categorized = await this.categorizeTransaction(transaction);

        // Map to FIN area if applicable
        const areaId = await this.mapToFinArea(categorized, userId);

        // Save transaction
        await this.saveTransaction({
          ...categorized,
          areaId,
        });

        imported++;
      } catch (error: any) {
        await this.log('error', `Failed to import transaction: ${error.message}`, { row });
        errors++;
      }
    }

    await this.emitEvent(EventTypes.FINANCE_LEDGER_INGESTED, {
      user_id: userId,
      source,
      imported,
      errors,
    });

    await this.log('info', `Ledger ingestion complete: ${imported} imported, ${errors} errors`);

    return { imported, errors };
  }

  /**
   * Import transactions from array
   */
  async importTransactions(payload: { userId: string; transactions: Transaction[] }): Promise<void> {
    const { userId, transactions } = payload;

    for (const tx of transactions) {
      await this.saveTransaction(tx);

      await this.emitEvent(EventTypes.FINANCE_TRANSACTION_CREATED, {
        transaction_id: tx.id,
        user_id: userId,
        amount: tx.amount,
        type: tx.type,
      });
    }
  }

  /**
   * Calculate profitability metrics
   */
  async calculateProfitability(payload: {
    userId: string;
    period: string;
  }): Promise<ProfitabilityMetrics> {
    const { userId, period } = payload;

    await this.log('info', `Calculating profitability for user ${userId}, period ${period}`);

    // Get all transactions for period
    const transactions = await this.getTransactions(userId, period);

    // Calculate totals
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + this.convertToBaseCurrency(t.amount, t.currency), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + this.convertToBaseCurrency(t.amount, t.currency), 0);

    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // Calculate by area (WRK, MUS, WRT, SPE)
    const byArea: Record<string, { income: number; expenses: number; profit: number }> = {};

    for (const areaCode of this.FIN_AREAS) {
      const area = await this.getAreaByCode(userId, areaCode);
      if (!area) continue;

      const areaTransactions = transactions.filter((t) => t.areaId === area.id);

      const income = areaTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + this.convertToBaseCurrency(t.amount, t.currency), 0);

      const expenses = areaTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + this.convertToBaseCurrency(t.amount, t.currency), 0);

      byArea[areaCode] = {
        income,
        expenses,
        profit: income - expenses,
      };
    }

    const metrics: ProfitabilityMetrics = {
      userId,
      period,
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      byArea,
    };

    await this.log('info', `Profitability calculated`, { metrics });

    return metrics;
  }

  /**
   * Analyze cashflow
   */
  async analyzeCashflow(payload: { userId: string; period: string }): Promise<CashflowAnalysis> {
    const { userId, period } = payload;

    await this.log('info', `Analyzing cashflow for user ${userId}, period ${period}`);

    // Get transactions
    const transactions = await this.getTransactions(userId, period);

    // Calculate flows
    const inflows = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + this.convertToBaseCurrency(t.amount, t.currency), 0);

    const outflows = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + this.convertToBaseCurrency(t.amount, t.currency), 0);

    // Get opening/closing balance (simplified)
    const openingBalance = await this.getBalance(userId, this.getPreviousPeriod(period));
    const closingBalance = openingBalance + inflows - outflows;

    // Calculate runway (days)
    const monthlyExpenses = outflows; // Assuming period is monthly
    const daysOfRunway = monthlyExpenses > 0 ? (closingBalance / monthlyExpenses) * 30 : 999;

    // Determine sufficiency
    let sufficiency: 'surplus' | 'adequate' | 'tight' | 'deficit';
    if (closingBalance < 0) sufficiency = 'deficit';
    else if (daysOfRunway < 30) sufficiency = 'tight';
    else if (daysOfRunway < 90) sufficiency = 'adequate';
    else sufficiency = 'surplus';

    const analysis: CashflowAnalysis = {
      userId,
      period,
      openingBalance,
      closingBalance,
      inflows,
      outflows,
      sufficiency,
      daysOfRunway: Math.round(daysOfRunway),
    };

    await this.log('info', `Cashflow analysis complete`, { analysis });

    return analysis;
  }

  /**
   * Update FIN dimensions with financial metrics
   */
  private async updateFinDimensions(eventPayload: any): Promise<void> {
    const { user_id, period } = eventPayload;

    await this.log('info', `Updating FIN dimensions for user ${user_id}`);

    // Calculate profitability
    const profitability = await this.calculateProfitability({ userId: user_id, period });

    // Calculate cashflow
    const cashflow = await this.analyzeCashflow({ userId: user_id, period });

    // Update FIN dimension scores for each area
    for (const areaCode of this.FIN_AREAS) {
      const area = await this.getAreaByCode(user_id, areaCode);
      if (!area) continue;

      const finDimension = await this.getDimension(area.id, 'FIN');
      if (!finDimension) continue;

      const areaMetrics = profitability.byArea[areaCode];
      if (!areaMetrics) continue;

      // Calculate FIN score (0-5) based on profitability
      let finScore = 2.5; // Neutral

      if (areaMetrics.profit > 0) {
        const profitRatio = areaMetrics.profit / (areaMetrics.income || 1);
        finScore = Math.min(5, 2.5 + profitRatio * 5);
      } else if (areaMetrics.profit < 0) {
        const lossRatio = Math.abs(areaMetrics.profit) / (areaMetrics.expenses || 1);
        finScore = Math.max(0, 2.5 - lossRatio * 5);
      }

      // Write to fd_score_raw
      await this.writeScore({
        userId: user_id,
        areaId: area.id,
        dimensionId: finDimension.id,
        scoreValue: finScore,
        confidence: 0.9, // High confidence for financial data
        source: 'finance_agent',
        metadata: {
          income: areaMetrics.income,
          expenses: areaMetrics.expenses,
          profit: areaMetrics.profit,
        },
      });
    }
  }

  /**
   * Parse transaction from various formats
   */
  private async parseTransaction(
    row: any,
    format: string,
    userId: string,
    source: string
  ): Promise<Transaction> {
    // Format-specific parsing
    switch (format) {
      case 'csv':
        return this.parseCSVTransaction(row, userId, source);
      case 'json':
        return this.parseJSONTransaction(row, userId, source);
      case 'quickbooks':
        return this.parseQuickBooksTransaction(row, userId, source);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private parseCSVTransaction(row: any, userId: string, source: string): Transaction {
    return {
      id: uuidv4(),
      userId,
      transactionDate: row.date || row.Date,
      description: row.description || row.Description,
      amount: parseFloat(row.amount || row.Amount),
      currency: row.currency || 'CAD',
      type: this.inferTransactionType(row),
      category: row.category || 'uncategorized',
      source,
    };
  }

  private parseJSONTransaction(row: any, userId: string, source: string): Transaction {
    return {
      id: row.id || uuidv4(),
      userId,
      transactionDate: row.date,
      description: row.description,
      amount: row.amount,
      currency: row.currency || 'CAD',
      type: row.type,
      category: row.category || 'uncategorized',
      source,
      metadata: row.metadata,
    };
  }

  private parseQuickBooksTransaction(row: any, userId: string, source: string): Transaction {
    // QuickBooks-specific parsing
    return {
      id: uuidv4(),
      userId,
      transactionDate: row.TxnDate,
      description: row.Memo || row.Description,
      amount: Math.abs(row.Amount),
      currency: row.CurrencyRef?.value || 'CAD',
      type: row.Amount > 0 ? 'income' : 'expense',
      category: row.AccountRef?.name || 'uncategorized',
      source,
    };
  }

  /**
   * Categorize transaction (AI/ML in production)
   */
  private async categorizeTransaction(transaction: Transaction): Promise<Transaction> {
    // In production: Use ML model for categorization
    // For now, simple keyword matching

    const description = transaction.description.toLowerCase();

    if (description.includes('salary') || description.includes('payment received')) {
      return { ...transaction, category: 'income_salary' };
    }

    if (description.includes('music') || description.includes('spotify')) {
      return { ...transaction, category: 'music_related' };
    }

    return transaction;
  }

  /**
   * Map transaction to FIN area
   */
  private async mapToFinArea(transaction: Transaction, userId: string): Promise<string | undefined> {
    // Map based on category
    if (transaction.category.includes('music')) {
      const area = await this.getAreaByCode(userId, 'MUS');
      return area?.id;
    }

    // Default to WRK for income
    if (transaction.type === 'income') {
      const area = await this.getAreaByCode(userId, 'WRK');
      return area?.id;
    }

    return undefined;
  }

  /**
   * Convert amount to base currency (CAD)
   */
  private convertToBaseCurrency(amount: number, currency: string): number {
    const rate = this.EXCHANGE_RATES[currency] || 1.0;
    return amount / rate;
  }

  /**
   * Infer transaction type from row data
   */
  private inferTransactionType(row: any): 'income' | 'expense' | 'transfer' {
    const amount = parseFloat(row.amount || row.Amount);
    return amount >= 0 ? 'income' : 'expense';
  }

  // Database helper methods (stubs)

  private async saveTransaction(transaction: Transaction): Promise<void> {
    await this.log('debug', 'Saving transaction', { transaction });
    // In production: INSERT INTO fd_finance_transactions
  }

  private async getTransactions(userId: string, period: string): Promise<Transaction[]> {
    // In production: SELECT FROM fd_finance_transactions
    return [];
  }

  private async getAreaByCode(userId: string, code: string): Promise<any> {
    // In production: SELECT FROM fd_areas WHERE user_id = ? AND code = ?
    return { id: 'area-' + code, code };
  }

  private async getDimension(areaId: string, code: string): Promise<any> {
    // In production: SELECT FROM fd_dimensions WHERE area_id = ? AND code = ?
    return { id: 'dim-' + code, code };
  }

  private async writeScore(score: any): Promise<void> {
    await this.log('debug', 'Writing FIN score', { score });
    // In production: INSERT INTO fd_score_raw
  }

  private async getBalance(userId: string, period: string): Promise<number> {
    // In production: Calculate from transactions or fetch from balance table
    return 10000; // Stub
  }

  private getPreviousPeriod(period: string): string {
    // Simple stub - in production, properly calculate previous period
    return period;
  }
}
