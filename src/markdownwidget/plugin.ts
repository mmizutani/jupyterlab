// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  JupyterLab, JupyterLabPlugin, InstanceTracker
} from '../application';

import {
  IDocumentRegistry
} from '../docregistry';

import {
  CommandIDs as FileBrowserCommandIDs
} from '../filebrowser';

import {
  IInstanceRestorer
} from '../instancerestorer';

import {
  IRenderMime
} from '../rendermime';

import {
  MarkdownWidget, MarkdownWidgetFactory
} from './widget';


/**
 * The class name for the text editor icon from the default theme.
 */
const TEXTEDITOR_ICON_CLASS = 'jp-ImageTextEditor';

/**
 * The name of the factory that creates markdown widgets.
 */
const FACTORY = 'Rendered Markdown';


/**
 * The markdown handler extension.
 */
const plugin: JupyterLabPlugin<void> = {
  activate,
  id: 'jupyter.extensions.rendered-markdown',
  requires: [IDocumentRegistry, IRenderMime, IInstanceRestorer],
  autoStart: true
};


/**
 * Activate the markdown plugin.
 */
function activate(app: JupyterLab, registry: IDocumentRegistry, rendermime: IRenderMime, restorer: IInstanceRestorer) {
    const factory = new MarkdownWidgetFactory({
      name: FACTORY,
      fileExtensions: ['.md'],
      rendermime
    });
    const shell = app.shell;
    const namespace = 'rendered-markdown';
    const tracker = new InstanceTracker<MarkdownWidget>({ namespace, shell });

    // Handle state restoration.
    restorer.restore(tracker, {
      command: FileBrowserCommandIDs.open,
      args: widget => ({ path: widget.context.path, factory: FACTORY }),
      name: widget => widget.context.path
    });

    factory.widgetCreated.connect((sender, widget) => {
      widget.title.icon = TEXTEDITOR_ICON_CLASS;
      // Notify the instance tracker if restore data needs to update.
      widget.context.pathChanged.connect(() => { tracker.save(widget); });
      tracker.add(widget);
    });

    registry.addWidgetFactory(factory);
  }


/**
 * Export the plugin as default.
 */
export default plugin;
