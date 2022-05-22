import * as vscode from 'vscode';
import * as fs from 'fs';

import { addNote, addPlainNote, updateNoteText, removeNote } from './note-db';
import { generateMarkdownReport } from './reporting';
import { NotesTree, TreeActions } from './notes-tree';
import { initializeStorageLocation, getAnnotationFilePath } from './configuration';
import { updateDecorations } from './decoration/decoration';

function registerDisposableCommand(context: vscode.ExtensionContext, command:string, callback: (...args: any[]) => void) {
    const disposable = vscode.commands.registerCommand(command, callback);
    context.subscriptions.push(disposable);
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "code-annotation" is now active!');

    initializeStorageLocation(context.globalStoragePath);

    const tree = new NotesTree();
    const treeActions = new TreeActions(tree);

    vscode.window.registerTreeDataProvider('codeAnnotationView', tree);
    vscode.commands.registerCommand('code-annotation.removeNote', treeActions.removeNote.bind(treeActions));
    vscode.commands.registerCommand('code-annotation.checkAllNotes', treeActions.checkAllNotes.bind(treeActions));
    vscode.commands.registerCommand('code-annotation.uncheckAllNotes', treeActions.uncheckAllNotes.bind(treeActions));
    vscode.commands.registerCommand('code-annotation.removeAllNotes', treeActions.removeAllNotes.bind(treeActions));
    vscode.commands.registerCommand('code-annotation.checkNote', treeActions.checkNote.bind(treeActions));
    vscode.commands.registerCommand('code-annotation.uncheckNote', treeActions.uncheckNote.bind(treeActions));
    vscode.commands.registerCommand('code-annotation.openNote', treeActions.openNote.bind(treeActions));
    vscode.commands.registerCommand('code-annotation.editNote', treeActions.editNote.bind(treeActions));
    vscode.commands.registerCommand('code-annotation.copyNote', treeActions.copyNote.bind(treeActions));
    vscode.commands.registerCommand('code-annotation.openNoteFromId', (id: string) => {
        treeActions.openNoteFromId(id);
    });

    vscode.commands.registerCommand('code-annotation.summary', () => {
        generateMarkdownReport();
    });

    vscode.commands.registerCommand('code-annotation.clearAllNotes', async () => {
        const message = 'Are you sure you want to clear all notes? This cannot be reverted.';
        const enableAction = 'I\'m sure';
        const cancelAction = 'Cancel';
        const userResponse = await vscode.window.showInformationMessage(message, enableAction, cancelAction);
        const clearAllNotes = userResponse === enableAction ? true : false;

        if (clearAllNotes) {
            const annotationFile = getAnnotationFilePath();
            fs.unlinkSync(annotationFile);
            vscode.commands.executeCommand('code-annotation.refreshEntry');
            vscode.window.showInformationMessage('All notes cleared!');
        }
    });

    registerDisposableCommand(context, 'code-annotation.addPlainNote', async () => {
        addPlainNote();
    });
    registerDisposableCommand(context, 'code-annotation.addNote', async () => {
        addNote();
    });
    registerDisposableCommand(context, 'code-annotation.hoverUpdateNoteText', async (id: string) => {
        updateNoteText(id);
    });
    registerDisposableCommand(context, 'code-annotation.hoverRemoveNote', async (id: string) => {
        removeNote(id);
    });

    vscode.workspace.onDidChangeConfiguration(() => updateDecorations(context) );

    updateDecorations(context);
}

// this method is called when your extension is deactivated
export function deactivate() { }
