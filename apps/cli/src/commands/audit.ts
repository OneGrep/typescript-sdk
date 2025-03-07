import chalk from 'chalk'
import ora from 'ora'
import { Command } from 'commander'
import { logger } from '../utils/logger'

import { getToolbox } from '@onegrep/sdk'

const spinner = ora({
  text: 'Loading...',
  color: 'yellow'
})

export const getAuditLogs = new Command()
  .name('audit')
  .aliases(['a'])
  .description('Check the health of the OneGrep API')
  .action(async () => {
    await fetchAuditLogs()
  })

export async function fetchAuditLogs() {
  const apiUrl = process.env.ONEGREP_API_URL
  logger.info(`Connecting to: ${chalk.bold(apiUrl)}`)
  spinner.start()

  const toolbox = await getToolbox()
  spinner.succeed(`Connected to ${chalk.bold(apiUrl)}`)

  const auditLogs = await toolbox.apiClient.get_audit_logs_api_v1_audit__get({
    queries: {
      page: 1,
      page_size: 10
    }
  })

  console.info(auditLogs)

  toolbox
    .close()
    .then(() => {
      logger.info(`Toolbox closed`)
    })
    .catch((error) => {
      logger.error(`Error closing toolbox: ${error}`)
    })
}
