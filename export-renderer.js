const $ = require('jquery');
require('jquery.fancytree');
const { ipcRenderer  } = require("electron");

    $(function() {

  $("#tree2").fancytree({
    activeVisible: true, // Make sure, active nodes are visible (expanded)
    aria: true, // Enable WAI-ARIA support
    autoActivate: true, // Automatically activate a node when it is focused using keyboard
    autoCollapse: false, // Automatically collapse all siblings, when a node is expanded
    autoScroll: false, // Automatically scroll nodes into visible area
    clickFolderMode: 4, // 1:activate, 2:expand, 3:activate and expand, 4:activate (dblclick expands)
    checkbox: true, // Show check boxes
    checkboxAutoHide: false, // Display check boxes on hover only
    debugLevel: 4, // 0:quiet, 1:errors, 2:warnings, 3:infos, 4:debug
    disabled: false, // Disable control
    focusOnSelect: false, // Set focus when node is checked by a mouse click
    escapeTitles: false, // Escape `node.title` content for display
    generateIds: false, // Generate id attributes like <span id='fancytree-id-KEY'>
    idPrefix: "ft2_", // Used to generate node idÂ´s like <span id='fancytree-id-<key>'>
    icon: false, // Display node icons
    keyboard: true, // Support keyboard navigation
    keyPathSeparator: "/", // Used by node.getKeyPath() and tree.loadKeyPath()
    minExpandLevel: 1, // 1: root node is not collapsible
    rtl: false, // Enable RTL (right-to-left) mode
    selectMode: 2, // 1:single, 2:multi, 3:multi-hier
    tabindex: "0", // Whole tree behaves as one single control
    tooltip: false, // Use title as tooltip (also a callback could be specified)
    titlesTabbable: true, // Add all node titles to TAB chain// Node titles can receive keyboard focus
    quicksearch: true, // Jump to nodes when pressing first character///must true for filter 
    
    source: { url: "tree-data.json" },

    modifyChild: function(event, data) {
      data.tree.info(event.type, data);
    },

    // --- Node events -------------------------------------------------
    activate: function(event, data) {
      logEvent(event, data);
      var node = data.node;
      // acces node attributes
      $("#echoActive").text(node.title);
      if( !$.isEmptyObject(node.data) ){
      }
    },
    beforeActivate: function(event, data) {
      logEvent(event, data, "current state=" + data.node.isActive());
      // return false to prevent default behavior (i.e. activation)
      //              return false;
    },
    beforeExpand: function(event, data) {
      logEvent(event, data, "current state=" + data.node.isExpanded());
      // return false to prevent default behavior (i.e. expanding or collapsing)
      //				return false;
    },
    beforeSelect: function(event, data) {
      //				console.log("select", event.originalEvent);
      logEvent(event, data, "current state=" + data.node.isSelected());
      // return false to prevent default behavior (i.e. selecting or deselecting)
      //				if( data.node.isFolder() ){
      //					return false;
      //				}
    },
    blur: function(event, data) {
      logEvent(event, data);
      $("#echoFocused").text("-");
    },
    click: function(event, data) {
      logEvent(event, data, ", targetType=" + data.targetType);
      // return false to prevent default behavior (i.e. activation, ...)
      //return false;
    },
    collapse: function(event, data) {
      logEvent(event, data);
    },
    createNode: function(event, data) {
      // Optionally tweak data.node.span or bind handlers here
      logEvent(event, data);
    },

    expand: function(event, data) {
      logEvent(event, data);
    },
    enhanceTitle: function(event, data) {
      logEvent(event, data);
    },
    focus: function(event, data) {
      logEvent(event, data);
      $("#echoFocused").text(data.node.title);
    },
    keydown: function(event, data) {
      logEvent(event, data);
      switch( event.which ) {
      case 32: // [space]
        data.node.toggleSelected();
        return false;
      }
    },
    keypress: function(event, data) {
      // currently unused
      logEvent(event, data);
    },
    loadChildren: function(event, data) {
      logEvent(event, data);
    },
    loadError: function(event, data) {
      logEvent(event, data);
    },
   
    renderNode: function(event, data) {
      // Optionally tweak data.node.span
      //              $(data.node.span).text(">>" + data.node.title);
      logEvent(event, data);
    },
    renderTitle: function(event, data) {
      // NOTE: may be removed!
      // When defined, must return a HTML string for the node title
      logEvent(event, data);
      //				return "new title";
    },
    select: function(event, data) {
      logEvent(event, data, "current state=" + data.node.isSelected());
      var s = data.tree.getSelectedNodes().join(", ");
      $("#echoSelected").text(s);
    }
  })
  .on("fancytreeactivate", function(event, data){
    // alternative way to bind to 'activate' event
    //		    logEvent(event, data);
  });

});

function logEvent(event, data, msg){
  msg = msg ? ": " + msg : "";
  $.ui.fancytree.info("Event('" + event.type + "', node=" + data.node + ")" + msg);
}

function exportSelectedDialog(){
  Metro.dialog.create({
      title: "Export Selected Dialog",
      content: '<div class="fixed-size-2"><div id="tree2" data-source="ajax" class="sampletree"></div></div>',

      actions: [
        {
          caption: "Cancel",
          cls: "js-dialog-close",
          onclick: function(){
            
              console.log("You clicked Cancel action Export Selected Dialog");
          }
        },
          {
              caption: "Export",
              cls: "js-dialog-close alert",
              onclick: function(){
                var tree = $.ui.fancytree.getTree("#tree2");
                var selectedNodes = tree.getSelectedNodes();
                var d = selectedNodes.map(function(node) {
                    return node.toDict(true);
                });
                showSaveFileDialog(JSON.stringify(d));
                console.log("You clicked Done action on Export Selected Dialog");
              }
          }   
      ]
  });
}
