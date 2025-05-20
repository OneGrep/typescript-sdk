import { createLangchainToolbox, getToolbox, LangchainToolbox } from "@onegrep/sdk";
import { ChatOpenAI } from "@langchain/openai";
import { MessageContent } from "@langchain/core/messages";
import { HumanMessage } from "@langchain/core/messages";
import inquirer from "inquirer";
import ora from "ora";
import chalk from "chalk";

interface ChatPrompt {
    message: string;
}

async function processMessage(toolbox: LangchainToolbox, message: string): Promise<MessageContent> {
    const spinner = ora('Processing your request...').start();
    try {
        const searchResult = await toolbox.search(message);
        const tools = searchResult.map((r) => r.result);
        console.log('\nAvailable tools:', tools.map(t => t.name));

        const model = new ChatOpenAI({ model: "gpt-4o-mini" });
        const modelWithTools = model.bind({
            tools: tools
        });

        // Let LangChain handle the tool execution and message management
        const messages = [new HumanMessage(message)];
        console.log('\nInitial message:', message);

        const result = await modelWithTools.invoke(messages);
        console.log('\nAI Response:', {
            content: result.content,
            tool_calls: result.additional_kwargs?.tool_calls,
            all_messages: messages
        });

        spinner.succeed();
        return result.content || 'No response generated';
    } catch (error) {
        spinner.fail('Error processing message');
        console.error('Full error:', error);
        throw error;
    }
}

async function start() {
    console.log(chalk.cyan('\n🤖 Welcome to the AI Chat Agent!\n'));

    const initSpinner = ora('Initializing toolbox...').start();
    let toolbox: LangchainToolbox | undefined;

    try {
        toolbox = await createLangchainToolbox(await getToolbox());
        initSpinner.succeed('Ready to chat');
    } catch (error) {
        initSpinner.fail('Failed to initialize toolbox');
        console.error(chalk.red('Error:'), error);
        process.exit(1);
    }

    if (!toolbox) {
        console.error(chalk.red('Failed to initialize toolbox'));
        process.exit(1);
    }

    while (true) {
        try {
            const response = await inquirer.prompt<ChatPrompt>({
                type: 'input',
                name: 'message',
                message: '💭 ' + chalk.green('You:')
            });

            if (response.message.toLowerCase() === 'exit' || response.message.toLowerCase() === 'quit') {
                console.log(chalk.yellow('\nGoodbye! 👋\n'));
                process.exit(0);
            }

            const result = await processMessage(toolbox!, response.message);
            console.log('\n' + chalk.blue('🤖 Assistant:'), result, '\n');
        } catch (error) {
            console.error(chalk.red('\nError:'), error);
            console.log(chalk.yellow('Please try again or type "exit" to quit.\n'));
        }
    }
}

start();
