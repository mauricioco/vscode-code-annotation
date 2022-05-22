import * as vscode from 'vscode';
import { getConfiguration } from '../configuration';
import { getNotes } from '../note-db';

const decorationType = () : vscode.TextEditorDecorationType => {
    return vscode.window.createTextEditorDecorationType({
        dark: {
            backgroundColor: getConfiguration().decorationColors?.dark
        },
        light: {
            backgroundColor: getConfiguration().decorationColors?.light
        }
    });
};

export const setDecorations = (): void => {
    if (!getConfiguration().enableDecoration)
    { return; }

    const openEditors = vscode.window.visibleTextEditors;

    openEditors.forEach( editor => {
        const decorationOptions: vscode.DecorationOptions[] = [];
        getNotes().forEach( note => {
            if (note.fileName === editor.document.fileName) {
                const positionStart = new vscode.Position(note.positionStart.line, note.positionStart.character);
                const positionEnd = new vscode.Position(note.positionEnd.line, note.positionEnd.character);
                decorationOptions.push({
                    range: new vscode.Range(positionStart, positionEnd),
                    hoverMessage: note.text
                })
            }
        });
        editor.setDecorations(decorationType(), decorationOptions);
    });
};

export function updateDecorations (context: vscode.ExtensionContext) {
    setDecorations();

    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            setDecorations();
        }
    }, null, context.subscriptions);

}
