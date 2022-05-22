import * as vscode from 'vscode';
import { getConfiguration } from '../configuration';
import { getNotes, Note } from '../note-db';

const decorationType: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
    dark: {
        backgroundColor: getConfiguration().decorationColors?.dark
    },
    light: {
        backgroundColor: getConfiguration().decorationColors?.light
    }
});

const getNoteStatusIcon = (note:Note) : string => {
    switch(note.status) {
        case 'pending':
            return '📝';
        case 'done':
            return '✅';
        default:
            return '❌';
    }
}

const getNoteTextWithFooter = (note:Note) => {
    const edit = `[Edit](${vscode.Uri.parse(
        `command:code-annotation.hoverUpdateNoteText?${encodeURIComponent(
            JSON.stringify(note.id.toString())
        )}`
    )})`;
    const remove = `[Remove](${vscode.Uri.parse(
        `command:code-annotation.hoverRemoveNote?${encodeURIComponent(
            JSON.stringify(note.id.toString())
        )}`
    )})`;
    const markdown = new vscode.MarkdownString(
        `${getNoteStatusIcon(note)} <span style="${getConfiguration().hoverStyle}">${note.text}</span>\n\n ${edit} ${remove}`
    );
    markdown.isTrusted = true;
    return markdown;
}

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
                    hoverMessage: getNoteTextWithFooter(note)
                })
            }
        });
        editor.setDecorations(decorationType, decorationOptions);
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
