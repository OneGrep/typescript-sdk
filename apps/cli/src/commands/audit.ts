import { Command } from 'commander'
import { logger } from '../utils/logger'
import { getSpinner } from 'utils/helpers'
import { getToolbox } from '@onegrep/sdk'

/**
 * Fetches audit logs with the specified pagination options
 */
async function fetchAuditLogs(options: { page?: number; pageSize?: number }) {
  const toolbox = await getToolbox()

  const spinner = getSpinner('Fetching audit logs...', 'yellow')
  spinner.start()

  const page = options.page || 0
  const pageSize = options.pageSize || 10

  const auditLogs = await toolbox.apiClient.get_audit_logs_api_v1_audit__get({
    queries: {
      page,
      page_size: pageSize
    }
  })

  spinner.succeed('Audit logs fetched')
  logger.info(`Showing page ${page} with ${pageSize} items per page`)
  logger.info(JSON.stringify(auditLogs, null, 2))

  toolbox
    .close()
    .catch((error) => {
      logger.error(`Error closing toolbox: ${error}`)
    })
}

export const getAuditLogs = new Command()
  .name('audit')
  .aliases(['a'])
  .description('Fetch and display audit logs')
  .option('-p, --page <number>', 'Page number to fetch', parseFloat)
  .option('-s, --page-size <number>', 'Number of items per page', parseFloat)
  .action(async (options) => {
    await fetchAuditLogs({
      page: options.page,
      pageSize: options.pageSize
    })
  })