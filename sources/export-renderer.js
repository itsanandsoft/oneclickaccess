const $ = require('jquery');
require('jquery.fancytree');
const { ipcRenderer  } = require("electron");
const path = require('path')
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
    //disabled: false, // Disable control
    //focusOnSelect: false, // Set focus when node is checked by a mouse click
    escapeTitles: false, // Escape `node.title` content for display
    generateIds: true, // Generate id attributes like <span id='fancytree-id-KEY'>
    idPrefix: "ft2_", // Used to generate node idÂ´s like <span id='fancytree-id-<key>'>
    icon: false, // Display node icons
    keyboard: true, // Support keyboard navigation
    keyPathSeparator: "/", // Used by node.getKeyPath() and tree.loadKeyPath()
    minExpandLevel: 1, // 1: root node is not collapsible
    //rtl: false, // Enable RTL (right-to-left) mode
    selectMode: 2, // 1:single, 2:multi, 3:multi-hier
    tabindex: "0", // Whole tree behaves as one single control
    //tooltip: false, // Use title as tooltip (also a callback could be specified)
    titlesTabbable: true, // Add all node titles to TAB chain// Node titles can receive keyboard focus
    //quicksearch: true, // Jump to nodes when pressing first character///must true for filter 
    
    source: { url: path.join(__dirname, `/../../../../tree-data.json`) },
    

    modifyChild: function(event, data) {
      //data.tree.info(event.type, data);
    },
    keydown: function(event, data) {
      logEvent(event, data);
      switch( event.which ) {
      case 32: // [space]
        data.node.toggleSelected();
        return false;
      }
    },
  
    // select: function(event, data) {
    //   if( data.node.isSelected() ) {
    //       data.node.visit(function(node){
    //           node.setSelected(true);
    //       });
    //   } else {
    //       data.node.visit(function(node){
    //           node.setSelected(false);
    //       });
    //   }
    //   },
    
      // activate: function(event, data) {
      //     data.node.setExpanded(true);
      // },
      // checkChildren: function(node, state) {
      //     node.visit(function(childNode){
      //         childNode.setSelected(state);
      //         childNode.checkChildren(state);
      //     });
      // }
    
  })
  .on("fancytreeactivate", function(event, data){
    // alternative way to bind to 'activate' event
    //		    logEvent(event, data);
  });

  $('#perform_selective_export').click(function(){
    var d = "";
    var tree = $.ui.fancytree.getTree("#tree2");
    
    var selectedNodes = tree.getSelectedNodes();
    var selectedNodes = tree.getSelectedNodes();
    var selectedNodesDict = [];
    
    selectedNodes.forEach(function(node) {
      selectedNodesDict.push(node.toDict(true));
    });
    // var d = selectedNodes.map(function(node) {
    //     return node.toDict(true);
    // });

    // Remove "partsel" and "selected" attributes
    var jsonString = JSON.stringify(selectedNodesDict, function(key, value) {
        if (key === "partsel" || key === "selected") {
            return;
        }
        return value;
    });
    showSaveFileDialog(jsonString);

    // var tree = $.ui.fancytree.getTree("#tree2");
    // var selectedNodes = tree.getSelectedNodes();
    // var d = selectedNodes.map(function(node) {
    //     return node.toDict(true);
    // });
    // showSaveFileDialog(JSON.stringify(d));
    console.log("You clicked Done action on Export Selected Dialog");

  });
  $('#cancel_export').click(function(){
    console.log("You clicked Cancel action Export Selected Dialog");

  });
});


function showSaveFileDialog(d) {
  ipcRenderer.invoke("showDialog", d);
}

function logEvent(event, data, msg){
  msg = msg ? ": " + msg : "";
  $.ui.fancytree.info("Event('" + event.type + "', node=" + data.node + ")" + msg);
}
