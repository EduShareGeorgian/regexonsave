// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, ExtensionContext, workspace, Disposable, TextDocument, WorkspaceEdit,Range, commands,TabInputText } from 'vscode';

interface IRuleDefinition {
  find: string;
  runOnLoad: boolean;
  mode: string;
  replace: string;
}

interface IRuleDefinitions {
  [ruleName: string]: IRuleDefinition;
}

interface IRuleSets {
  [fileExt: string]: IRuleDefinitions;
}

let disposable: Disposable;
const OutputChannel = window.createOutputChannel(`Output Channel`);

export async function activate(context: ExtensionContext) {
  OutputChannel.clear();
  OutputChannel.show();
  OutputChannel.appendLine(`RegexOnSave Activated`);
  const configRules = workspace.getConfiguration("regexonsave").get<IRuleSets>("rulesets");

  if (configRules) {
    const fileExts = Object.keys(configRules);
	
		Promise.allSettled( fileExts.map(async (ext) => {	
			if(Object.values(configRules[ext]).some(rule => rule.runOnLoad)){
			const MatchedFiles = await workspace.findFiles('**/*.'+ext);
			Promise.allSettled ( MatchedFiles.map (async (file) => {
				const edit = new WorkspaceEdit();
				const document = await workspace.openTextDocument(file);						
				updateTextDocument(document,configRules[ext],edit);			
				if(edit.size === 0) {
					OutputChannel.appendLine(`File: ${file.path} has no changes`);
					return;
				}
				const isSuccessful = await workspace.applyEdit(edit);		
				await document.save();
				OutputChannel.appendLine(`File: ${file.path} updated ${isSuccessful ? 'successfully' : 'unsuccessfully'}`);
		})).then(async () => {
		Promise.allSettled (MatchedFiles.map(async (file) => {
			const sourceGroup = window.tabGroups.all[0]; // 'all' array is 0-based
			const groups = window.tabGroups.all;
			// note small "c" to match how Uri.fsPath looks
			const myPath = file;
			const foundTab = sourceGroup.tabs.filter(tab => 
				(tab.input instanceof TabInputText) && (tab.input.uri.fsPath === myPath.fsPath)
			);

			// close() takes an array or a single tab
			if (foundTab?.length === 1) { 
				await window.tabGroups.close(foundTab, false); 
				OutputChannel.appendLine(`RegexOnSave: ${file.fsPath} closed`);
			}
		}
		));
	});
	}
	}));
	
	
    disposable = workspace.onWillSaveTextDocument(({ document, waitUntil }) => {	
      const fileName = document.fileName;
	  if(fileName.endsWith("settings.json"))
	  {
		commands.executeCommand('workbench.action.reloadWindow');
		return;
	  }
      const fileExt = fileExts.find(ext => fileName.endsWith(ext));

      if (fileExt) {
        waitUntil(workspace.applyEdit(updateTextDocument(document, configRules[fileExt])));
      }
    });
  }
}

export function deactivate() {
  disposable?.dispose();
  disposable = undefined as any;
}

function updateTextDocument(document: TextDocument, ruleDefinitions: IRuleDefinitions, edit: WorkspaceEdit = new WorkspaceEdit()): WorkspaceEdit {  
  const rules = Object.values(ruleDefinitions);
  const oeText = document.getText();
  const newText = rules.reduce((text, rule) => {
    return text.replace(new RegExp(rule.find, rule.mode), rule.replace);
  }, oeText);
  if (newText !== oeText) { //only edit and create a 'change' if we need to.
	edit.replace(
		document.uri,
		new Range(0, 0, document.lineCount, 0),
		newText
	  );
  }

  return edit;
}
