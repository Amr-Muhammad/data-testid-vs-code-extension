import * as vscode from 'vscode';
import { getTagName, getSmartKeyword, getInsertText } from '../helpers/utils';

let userChoice: 'auto' | 'manual' | undefined = undefined;

export async function activate(context: vscode.ExtensionContext) {
	console.log('Extension "data-testid-generator" is now active!');

	const config = vscode.workspace.getConfiguration('dataTestIdGenerator');
	const prefix = config.get<string>('prefix') || '';

	userChoice = context.globalState.get<'auto' | 'manual'>('dataTestIdMode');

	const setModeCommand = vscode.commands.registerCommand('data-testid-generator.setMode', async () => {
		const selection = await vscode.window.showQuickPick([
			'Auto-generate value',
			'Leave it empty'
		], {
			placeHolder: 'How do you want to handle data-testid value?'
		});

		if (selection === 'Auto-generate value') {
			userChoice = 'auto';
			await context.globalState.update('dataTestIdMode', 'auto');
			vscode.window.showInformationMessage('✅ Auto-generation mode enabled!');
		} else if (selection === 'Leave it empty') {
			userChoice = 'manual';
			await context.globalState.update('dataTestIdMode', 'manual');
			vscode.window.showInformationMessage('✅ Manual input mode enabled!');
		}
	});

	const resetModeCommand = vscode.commands.registerCommand('data-testid-generator.resetMode', async () => {
		userChoice = undefined;
		await context.globalState.update('dataTestIdMode', undefined);
		vscode.window.showInformationMessage('Auto Insert Mode reset. Set it again from the Command Palette.');
	});

	const provider = vscode.languages.registerCompletionItemProvider(
		['html', 'javascriptreact', 'typescriptreact', 'vue'],
		{
			provideCompletionItems(document, position) {
				if (!userChoice) {
					vscode.window.showWarningMessage('Please run "Set Auto Insert Mode" from the Command Palette.');
					return [];
				}

				// 👇 Collect full tag (even if spans multiple lines)
				let fullTag = '';
				let lineNum = position.line;
				while (lineNum < document.lineCount) {
					const text = document.lineAt(lineNum).text.trim();
					fullTag += ' ' + text;
					if (text.includes('>')) break;
					lineNum++;
				}

				fullTag = fullTag.trim();
				const tag = getTagName(fullTag) || 'element';
				const keyword = getSmartKeyword(tag, fullTag);

				const insertText = userChoice === 'auto'
					? `data-testid="${getInsertText(tag, keyword, prefix)}"`
					: 'data-testid="$1"';

				const completion = new vscode.CompletionItem('data-testid', vscode.CompletionItemKind.Snippet);
				completion.insertText = new vscode.SnippetString(insertText);
				completion.sortText = '0000';
				completion.preselect = true;
				completion.documentation = new vscode.MarkdownString('Insert a data-testid attribute');

				return [completion];
			}

		}
	);

	context.subscriptions.push(provider, setModeCommand, resetModeCommand);
}

export function deactivate() { }
