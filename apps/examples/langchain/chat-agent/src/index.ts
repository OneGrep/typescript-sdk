import {
  createLangchainToolbox,
  getToolbox,
  LangchainToolbox
} from '@onegrep/sdk'
import { ChatOpenAI } from '@langchain/openai'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import {
  HumanMessage,
  AIMessage,
  BaseMessage,
  SystemMessage
} from '@langchain/core/messages'
import {
  ChatPromptTemplate,
  MessagesPlaceholder
} from '@langchain/core/prompts'
import inquirer from 'inquirer'
import ora from 'ora'
import chalk from 'chalk'

const OPENAI_MODEL = 'gpt-4o-mini'

interface ChatPrompt {
  message: string
}

async function createAgent(model: ChatOpenAI, tools: any[]) {
  // Create the React agent
  return createReactAgent({
    llm: model,
    tools
  })
}

async function getIntent(message: string) {
  const spinner = ora('Extracting goal...').start()
  // First, use a separate LLM call to understand the intent and search for relevant tools
  const intentModel = new ChatOpenAI({
    modelName: OPENAI_MODEL,
    streaming: true,
    callbacks: [
      {
        handleLLMNewToken(token: string) {
          process.stdout.write(token)
        }
      }
    ]
  })

  const intentResult = await intentModel.invoke([
    new SystemMessage(
      `Summarize what the sub-goal is based on the user's request: ${message}`
    )
  ])

  spinner.succeed('Done')
  return intentResult.content
}

async function processMessage(
  toolbox: LangchainToolbox,
  message: string,
  chatHistory: BaseMessage[] = []
): Promise<string> {
  const spinner = ora('Thinking...').start()
  try {
    // First, use a separate LLM call to understand the intent and search for relevant tools
    const intentResult = await getIntent(message)

    // Search and select the most relevant tools based on the goal.
    spinner.text = 'Searching for relevant tools...'
    const searchResult = await toolbox.search(
      typeof intentResult === 'string' ? intentResult : message
    )
    const selectedTools = searchResult.map((r) => r.result)
    console.debug(`Tools found: ${selectedTools.map((t) => t.name).join(', ')}`)

    // Create the agent with the discovered tools
    spinner.text = 'Generating conclusions...'
    const model = new ChatOpenAI({
      modelName: OPENAI_MODEL,
      streaming: true,
      callbacks: [
        {
          handleLLMNewToken(token: string) {
            process.stdout.write(token)
          }
        }
      ]
    })

    const agent = await createAgent(model, selectedTools)

    // Execute the agent
    const result = await agent.invoke(
      {
        messages: [...chatHistory, new HumanMessage(message)]
      },
      {
        recursionLimit: 10 // Equivalent to maxIterations in old AgentExecutor
      }
    )

    const aiResponse = result.messages[result.messages.length - 1].content

    spinner.succeed('Done')
    return typeof aiResponse === 'string' ? aiResponse : 'No response generated'
  } catch (error) {
    if (error instanceof Error && error.name === 'GraphRecursionError') {
      spinner.fail('Agent reached maximum number of steps')
      return 'I reached my step limit. Could you try breaking down your request into smaller parts?'
    }
    spinner.fail('Error processing message')
    console.error('Full error:', error)
    throw error
  }
}

async function start() {
  console.log(chalk.cyan('\n🤖 Welcome to the AI Agent!\n'))

  const initSpinner = ora('Initializing toolbox...').start()
  let toolbox: LangchainToolbox | undefined

  try {
    toolbox = await createLangchainToolbox(await getToolbox())
    initSpinner.succeed('Ready to chat')
  } catch (error) {
    initSpinner.fail('Failed to initialize toolbox')
    console.error(chalk.red('Error:'), error)
    process.exit(1)
  }

  if (!toolbox) {
    console.error(chalk.red('Failed to initialize toolbox'))
    process.exit(1)
  }

  // Maintain chat history
  const chatHistory: BaseMessage[] = [
    new SystemMessage(
      `You are a helpful assistant that can answer questions and help with tasks.`
    )
  ]

  while (true) {
    try {
      const response = await inquirer.prompt<ChatPrompt>({
        type: 'input',
        name: 'message',
        message: '💭 ' + chalk.green('You:')
      })

      if (
        response.message.toLowerCase() === 'exit' ||
        response.message.toLowerCase() === 'quit'
      ) {
        console.log(chalk.yellow('\nGoodbye! 👋\n'))
        process.exit(0)
      } else if (response.message.length === 0) {
        console.log(chalk.yellow('\nPlease enter a message.\n'))
        continue
      }

      const result = await processMessage(
        toolbox!,
        response.message,
        chatHistory
      )

      // Add the interaction to chat history
      chatHistory.push(new HumanMessage(response.message))
      chatHistory.push(new AIMessage(result))

      console.log('\n' + chalk.blue('🤖 Assistant:'), result, '\n')
    } catch (error) {
      console.error(chalk.red('\nError:'), error)
      console.log(chalk.yellow('Please try again or type "exit" to quit.\n'))
    }
  }
}

start()
