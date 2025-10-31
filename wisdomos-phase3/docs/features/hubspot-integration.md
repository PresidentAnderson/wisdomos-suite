# HubSpot Integration for WisdomOS

## Overview
The HubSpot integration automatically synchronizes CRM data with WisdomOS, creating contributions based on your professional activities and relationships.

## Features

### 🔄 Real-time Webhook Synchronization
- Instant updates when contacts, deals, companies, or tickets change in HubSpot
- Automatic contribution creation based on CRM events
- Secure webhook signature verification

### 📊 Data Synchronization
- Sync contacts from HubSpot to WisdomOS
- Import deals and track business achievements
- Monitor company relationships
- Track support tickets

### 🎯 Automatic Contribution Mapping
- **New Contacts** → "Being" contributions (relationship building)
- **New Deals** → "Having" contributions (financial opportunities)
- **Closed Won Deals** → "Having" contributions (achievements)
- **New Companies** → "Doing" contributions (business partnerships)

## Configuration

### Environment Variables
```env
# HubSpot Private App Key
HUBSPOT_PRIVATE_APP_KEY=your-hubspot-private-app-key-here

# Webhook URL (optional, defaults to your app URL)
WEBHOOK_URL=https://your-app.vercel.app/api/hubspot/webhook
```

**Note:** The actual HubSpot private app key is stored securely in 1Password. 
To retrieve it: `op item get 'WisdomOS HubSpot Integration' --fields api_key`

### Setting Up Webhooks

1. **Run the setup script:**
```bash
npm run setup:hubspot-webhooks
```

2. **Or manually configure in HubSpot:**
   - Go to your HubSpot app settings
   - Navigate to Webhooks
   - Add webhook URL: `https://your-app.vercel.app/api/hubspot/webhook`
   - Subscribe to events:
     - contact.creation
     - contact.propertyChange
     - deal.creation
     - deal.propertyChange
     - company.creation
     - ticket.creation

## API Endpoints

### Webhook Endpoints
- `POST /api/hubspot/webhook` - Receive webhook events from HubSpot
- `GET /api/hubspot/webhook/status` - Check webhook configuration status
- `POST /api/hubspot/webhook/register` - Register webhook subscriptions

### Sync Endpoints
- `POST /api/hubspot/sync/contacts` - Manually sync contacts
- `POST /api/hubspot/sync/deals` - Manually sync deals

## How It Works

### 1. Contact Creation Flow
```mermaid
graph LR
    A[New Contact in HubSpot] --> B[Webhook Event]
    B --> C[WisdomOS Receives Event]
    C --> D[Create "Being" Contribution]
    D --> E[Mirror to Life Areas]
```

### 2. Deal Won Flow
```mermaid
graph LR
    A[Deal Closed Won] --> B[Webhook Event]
    B --> C[WisdomOS Receives Event]
    C --> D[Create "Having" Achievement]
    D --> E[Update Financial Life Area]
```

## Contribution Categories

### Being (Personal Growth)
- New professional connections
- Relationship milestones
- Network expansion

### Doing (Professional Activities)
- New business partnerships
- Active deal management
- Company collaborations

### Having (Achievements & Assets)
- Closed deals
- Revenue generation
- Business opportunities

## Security

### Webhook Signature Verification
All webhook requests are verified using HubSpot's signature:
```javascript
const hash = crypto
  .createHash('sha256')
  .update(HUBSPOT_KEY + JSON.stringify(payload))
  .digest('hex');
```

### API Authentication
All API calls use Bearer token authentication with your private app key.

## Testing

### Test Webhook Endpoint
```bash
npm run test:hubspot-webhook
```

### Verify Integration Status
```bash
curl https://your-app.vercel.app/api/hubspot/webhook/status
```

## UI Integration

Access the HubSpot integration from:
1. Navigate to Settings in WisdomOS
2. Click on "Integrations" tab
3. View HubSpot connection status
4. Sync data manually if needed
5. Monitor recent webhook events

## Monitoring

### View Recent Events
The integration UI shows:
- Connection status
- Last sync time
- Total contacts/deals/companies
- Recent webhook events with processing status

### Logs
Check application logs for:
- Webhook processing details
- Sync operation results
- Error messages

## Troubleshooting

### Webhooks Not Receiving
1. Verify webhook URL is accessible
2. Check HubSpot app settings
3. Ensure private app key is correct
4. Test with webhook testing tool

### Sync Failures
1. Check API rate limits
2. Verify authentication
3. Check network connectivity
4. Review error logs

### Missing Contributions
1. Verify webhook subscriptions are active
2. Check contribution creation logic
3. Ensure user mapping is correct
4. Review audit logs

## Best Practices

1. **Regular Monitoring**: Check integration status weekly
2. **Data Validation**: Verify contributions match CRM activities
3. **Security**: Rotate private app key periodically
4. **Performance**: Use batch sync for large datasets
5. **Error Handling**: Implement retry logic for failed webhooks

## Limitations

- Maximum 100 contacts/deals per sync operation
- Webhook events are processed sequentially
- Rate limited to HubSpot API limits (100 requests/10 seconds)
- Contributions require user context (manual mapping needed)

## Future Enhancements

- [ ] Two-way sync (push WisdomOS data to HubSpot)
- [ ] Custom field mapping
- [ ] Batch webhook processing
- [ ] Advanced contribution scoring
- [ ] AI-powered categorization
- [ ] Team collaboration features
- [ ] Analytics dashboard
- [ ] Automated user mapping

## Support

For issues or questions:
1. Check the logs in `/api/hubspot/webhook/status`
2. Review webhook events in HubSpot portal
3. Contact support with correlation IDs

## License

Part of WisdomOS - Phoenix Journey Platform