const $ = require('jquery');
require('jquery.fancytree');
require('jquery.fancytree/dist/modules/jquery.fancytree.dnd5.js');
require('jquery.fancytree/dist/modules/jquery.fancytree.edit.js');
require('jquery.fancytree/dist/modules/jquery.fancytree.filter.js');
require('ui-contextmenu');
const { ipcRenderer,globalShortcut  } = require("electron");

    var CLIPBOARD = null;

    $(function() {
      ipcRenderer.invoke('getDecryptedData','tree-data.json').then((decryptedData) => {
        if (decryptedData) {
          const jsonData = JSON.parse(decryptedData);
          //
          var counter = 0; // initialize counter variable
        $("#tree")
          .fancytree({
            activeVisible: true, // Make sure, active nodes are visible (expanded)
            aria: true, // Enable WAI-ARIA support
            autoActivate: true, // Automatically activate a node when it is focused using keyboard
            autoCollapse: false, // Automatically collapse all siblings, when a node is expanded
            autoScroll: false, // Automatically scroll nodes into visible area
            clickFolderMode: 1, // 1:activate, 2:expand, 3:activate and expand, 4:activate (dblclick expands)
            checkbox: false, // Show check boxes
            checkboxAutoHide: true, // Display check boxes on hover only
            debugLevel: 4, // 0:quiet, 1:errors, 2:warnings, 3:infos, 4:debug
            disabled: false, // Disable control
            editable: true,
            focusOnSelect: false, // Set focus when node is checked by a mouse click
            escapeTitles: false, // Escape `node.title` content for display
            generateIds: false, // Generate id attributes like <span id='fancytree-id-KEY'>
            idPrefix: "ft_", // Used to generate node idÂ´s like <span id='fancytree-id-<key>'>
            icon: false, // Display node icons
            keyboard: true, // Support keyboard navigation
            keyPathSeparator: "/", // Used by node.getKeyPath() and tree.loadKeyPath()
            minExpandLevel: 1, // 1: root node is not collapsible
            rtl: false, // Enable RTL (right-to-left) mode
            selectMode: 1, // 1:single, 2:multi, 3:multi-hier
            tabindex: "0", // Whole tree behaves as one single control
            tooltip: false, // Use title as tooltip (also a callback could be specified)
            titlesTabbable: true, // Add all node titles to TAB chain// Node titles can receive keyboard focus
            quicksearch: true, // Jump to nodes when pressing first character///must true for filter 
            
           
            skin: 'skin-win8',
            source: jsonData,
            extensions: ["edit", "dnd5", "filter"],

            filter: {
              autoApply: true,   // Re-apply last filter if lazy data is loaded
              autoExpand: false, // Expand all branches that contain matches while filtered
              counter: true,     // Show a badge with number of matching child nodes near parent icons
              fuzzy: false,      // Match single characters in order, e.g. 'fb' will match 'FooBar'
              hideExpandedCounter: true,  // Hide counter badge if parent is expanded
              hideExpanders: false,       // Hide expanders if all child nodes are hidden by filter
              highlight: true,   // Highlight matches by wrapping inside <mark> tags
              leavesOnly: false, // Match end nodes only
              nodata: true,      // Display a 'no data' status node if result is empty
              mode: "hide"        //mode: "dimm"       // Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
            },
            dnd5: {
              preventVoidMoves: true,
              preventRecursion: true,
              autoExpandMS: 400,
              dragStart: function(node, data) {
                
                return true;
              },
              dragEnter: function(node, data) {
                // return ["before", "after"];
                return true;
              },
              dragDrop: function(node, data) {
                data.otherNode.moveTo(node, data.hitMode);
                //treeDataChangeEvent();
              },
            },
            edit: {
              triggerStart: ["f2", "shift+click", "mac+enter"],
              close: function(event, data) {
                if (data.save && data.isNew) {
                  // Quick-enter: add new nodes until we hit [enter] on an empty title
                  $("#tree").trigger("nodeCommand", {
                    cmd: "addSibling",
                  });
                }
              },
            },
            extraClasses: {
              // Add a class to the node based on whether it has a shortcut key
              get: function(node) {
                return node.data.shortcutKey ? "has-shortcut-key" : "";
              },
              // get: function(node) {
              //   return node.data.timezone ? "has-timezone-key" : "";
              // }
            },
            createNode: function(event, data) {
              var node = data.node;
            },
            beforeRemove: function(event, data) {
              var removedNode = data.node;
            
              console.log("Node will be removed:", removedNode.title);
            },beforeNodeRemove: function(event, data) {
              var removedNode = data.node;
            
              console.log("Node will be removed:", removedNode.title);
            },
            
            modifyChild: function(event, data) {
              data.tree.info(event.type, data);
              setTimeout(function() {
                saveTreeState();
              }, 500);
            },
            
            // --- Tree events -------------------------------------------------
            blurTree: function(event, data) {
              //////logEvent(event, data);
            },
            create: function(event, data) {
              //////logEvent(event, data);
            },
            init: function(event, data, flag) {
              //////logEvent(event, data, "flag=" + flag);
              
            },
            focusTree: function(event, data) {
              //////logEvent(event, data);
            },
            restore: function(event, data) {
              //////logEvent(event, data);
            },
            // --- Node events -------------------------------------------------
            activate: function(event, data) {
              //////logEvent(event, data);
              var node = data.node;
              // acces node attributes
              //$("#echoActive").text(node.title);
              if( !$.isEmptyObject(node.data) ){
              //					alert("custom node data: " + JSON.stringify(node.data));
              }
            },
            // beforeSelect: function(event, data) {
            //   if (data.node.isSelected() && data.originalEvent.type === "keydown" && data.originalEvent.keyCode === $.ui.keyCode.DELETE) {
            //     var node = data.node;
            //     console.log("Before removing node hahahahahh:", node.title);
            //     // Perform additional actions or validations before removing the node
            //   }
            // },
            beforeActivate: function(event, data) {
              //////logEvent(event, data, "current state=" + data.node.isActive());
              // return false to prevent default behavior (i.e. activation)
              //              return false;
            },
            beforeExpand: function(event, data) {
              //////logEvent(event, data, "current state=" + data.node.isExpanded());
              // return false to prevent default behavior (i.e. expanding or collapsing)
              //				return false;
              
            },
            beforeSelect: function(event, data) {
              //				console.log("select", event.originalEvent);
              
              //////logEvent(event, data, "current state=" + data.node.isSelected());
              // return false to prevent default behavior (i.e. selecting or deselecting)
              //				if( data.node.isFolder() ){
              //					return false;
              //				}
            },
            blur: function(event, data) {
              //////logEvent(event, data);
              //$("#echoFocused").text("-");
            },
            click: function(event, data) {
              //////logEvent(event, data, ", targetType=" + data.targetType);
              // return false to prevent default behavior (i.e. activation, ...)
              //return false;
            },
            collapse: function(event, data) {
              //////logEvent(event, data);
            },
            createNode: function(event, data) {
              // Optionally tweak data.node.span or bind handlers here
              //////logEvent(event, data);
              //treeDataChangeEvent();
            },
            dblclick: function(event, data) {
              //////logEvent(event, data);
              var node = $.ui.fancytree.getTree("#tree").getActiveNode();
              if( node ){
                //if(node.type)
                //{
                //  editImgFileFolder(node);
                //}
                //else
                //{
                    openChildClickValueDialog(node);
                //}
                console.log("Currently active: " + node.title);
              }else{
                console.log("No active node.");
              }
                //				data.node.toggleSelect();
            },
            deactivate: function(event, data) {
              //////logEvent(event, data);
              //$("#echoActive").text("-");
            },
            
            expand: function(event, data) {
              //////logEvent(event, data);
            },
            enhanceTitle: function(event, data) {
              //////logEvent(event, data);
              //treeDataChangeEvent();
            },
            focus: function(event, data) {
              //////logEvent(event, data);
             // $("#echoFocused").text(data.node.title);
            },
            keydown: function(event, data) {
              //////logEvent(event, data);
              switch( event.which ) {
              case 32: // [space]
                data.node.toggleSelected();
                return false;
              }
              //treeDataChangeEvent();
            },
            keypress: function(event, data) {
              // currently unused
              //////logEvent(event, data);
              //treeDataChangeEvent();
            },
            loadChildren: function(event, data) {
              //////logEvent(event, data);
            },
            loadError: function(event, data) {
              //////logEvent(event, data);
            },
            renderNode: function(event, data) {
              //////logEvent(event, data);
              var node = data.node;
              var $titleSpan = $(node.span).find(".fancytree-title");
              // Add your custom title content to the existing title span
              
              if ((typeof node.data.shortcutKeys !== "undefined") && (node.data.shortcutKeys != ""))
              {
                var stringTitle = $titleSpan.text();
                if (stringTitle.includes("(") && stringTitle.includes("+") && stringTitle.includes(")")) {
                  console.log("The string contains Shortcut key No render.");
                } else {
                  console.log(stringTitle);
                  $titleSpan.append(" (" + node.data.shortcutKeys + ")");
                }
                
              }
              // if ((typeof node.data.timezone !== "undefined") && (node.data.timezone != "")) {
              //   $titleSpan.append(" - Current Date and Time");
              // }
            },
            renderTitle: function(event, data) {
              //////logEvent(event, data);
            },
            select: function(event, data) {
              //////logEvent(event, data, "current state=" + data.node.isSelected());
              var s = data.tree.getSelectedNodes().join(", ");
              $("#echoSelected").text(s);
              
            }
          }).on("fancytreeactivate", function(event, data){
            // alternative way to bind to 'activate' event
            //		    logEvent(event, data);
           })
          .on("mouseenter mouseleave", ".fancytree-title", function(event){
            // Add a hover handler to all node titles (using event delegation)
            var node = $.ui.fancytree.getNode(event);
            node.info(event.type);
            
          })
          .on("nodeCommand", function(event, data) {
            // Custom event handler that is triggered by keydown-handler and
            // context menu:
            var refNode,
              moveMode,
              tree = $.ui.fancytree.getTree(this),
              node = tree.getActiveNode();

            switch (data.cmd) {
              case "addChild":
              case "addSibling":
              case "indent":
              case "moveDown":
              case "moveUp":
              case "outdent":
              case "remove":
                if (node.data && "shortcutKeys" in node.data) {
                  var shortcutKey = node.data.shortcutKeys;
                  removeShortcutkey(shortcutKey);
                }
                tree.applyCommand(data.cmd, node);
                break;
              case "rename":
                tree.applyCommand(data.cmd, node);
                break;
              case "cut":
                CLIPBOARD = { mode: data.cmd, data: node };
                break;
              case "copy":
                CLIPBOARD = {
                  mode: data.cmd,
                  data: node.toDict(true, function(dict, node) {
                    delete dict.key;
                  }),
                };
                break;
              case "clear":
                CLIPBOARD = null;
                break;
              case "paste":
                if (CLIPBOARD.mode === "cut") {
                  // refNode = node.getPrevSibling();
                  CLIPBOARD.data.moveTo(node, "child");
                  CLIPBOARD.data.setActive();
                } else if (CLIPBOARD.mode === "copy") {
                  node.addChildren(
                    CLIPBOARD.data
                  ).setActive();
                }
                break;
              default:
                alert("Unhandled command: " + data.cmd);
                return;
            }
          })
          .on("keydown", function(e) {
            var cmd = null;

            // console.log(e.type, $.ui.fancytree.eventToString(e));
            switch ($.ui.fancytree.eventToString(e)) {
              case "ctrl+shift+n":
              case "meta+shift+n": // mac: cmd+shift+n
                cmd = "addChild";
                break;
              case "ctrl+c":
              case "meta+c": // mac
                cmd = "copy";
                break;
              case "ctrl+v":
              case "meta+v": // mac
                cmd = "paste";
                break;
              case "ctrl+x":
              case "meta+x": // mac
                cmd = "cut";
                break;
              case "ctrl+n":
              case "meta+n": // mac
                cmd = "addSibling";
                break;
              case "del":
              case "meta+backspace": // mac
                cmd = "remove";
                break;
              // case "f2":  // already triggered by ext-edit pluging
              //   cmd = "rename";
              //   break;
              case "ctrl+up":
              case "ctrl+shift+up": // mac
                cmd = "moveUp";
                break;
              case "ctrl+down":
              case "ctrl+shift+down": // mac
                cmd = "moveDown";
                break;
              case "ctrl+right":
              case "ctrl+shift+right": // mac
                cmd = "indent";
                break;
              case "ctrl+left":
              case "ctrl+shift+left": // mac
                cmd = "outdent";
            }
            if (cmd) {
              $(this).trigger("nodeCommand", { cmd: cmd });
              return false;
            }
          });
          var tree = $.ui.fancytree.getTree("#tree");
          $("input[name=search]").on("keyup", function(e){
            var n,
              tree = $.ui.fancytree.getTree(),
              args = "autoApply autoExpand fuzzy hideExpanders highlight leavesOnly nodata".split(" "),
              opts = {},
              filterFunc = $("#branchMode").is(":checked") ? tree.filterBranches : tree.filterNodes,
              match = $(this).val();

            $.each(args, function(i, o) {
              opts[o] = $("#" + o).is(":checked");
            });
            opts.mode = $("#hideMode").is(":checked") ? "hide" : "dimm";

            if(e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === ""){
              $("button#btnResetSearch").trigger("click");
              return;
            }
            if($("#regex").is(":checked")) {
              // Pass function to perform match
              n = filterFunc.call(tree, function(node) {
                return new RegExp(match, "i").test(node.title);
              }, opts);
            } else {
              // Pass a string to perform case insensitive matching
              n = filterFunc.call(tree, match, opts);
            }
            $("button#btnResetSearch").attr("disabled", false);
            $("span#matches").text("(" + n + " matches)");
          }).focus();

          $("button#btnResetSearch").click(function(e){
            $("input[name=search]").val("");
            $("span#matches").text("");
            tree.clearFilter();
          }).attr("disabled", true);

          $("fieldset input:checkbox").change(function(e){
              var id = $(this).attr("id"),
                flag = $(this).is(":checked");

              // Some options can only be set with general filter options (not method args):
              switch( id ){
              case "counter":
              case "hideExpandedCounter":
                tree.options.filter[id] = flag;
                break;
              }
              tree.clearFilter();
              $("input[name=search]").keyup();
          });
          $("#tree").contextmenu({
            delegate: "span.fancytree-node",
            menu: [
              {
                title: "Edit <kbd>[F2]</kbd>",
                cmd: "rename",
                uiIcon: "ui-icon-pencil",
              },
              {
                title: "Delete <kbd>[Del]</kbd>",
                cmd: "remove",
                uiIcon: "ui-icon-trash",
              },
              { title: "----" },
              {
                title: "New sibling <kbd>[Ctrl+N]</kbd>",
                cmd: "addSibling",
                uiIcon: "ui-icon-plus",
              },
              {
                title: "New child <kbd>[Ctrl+Shift+N]</kbd>",
                cmd: "addChild",
                uiIcon: "ui-icon-arrowreturn-1-e",
              },
              { title: "----" },
              {
                title: "Cut <kbd>Ctrl+X</kbd>",
                cmd: "cut",
                uiIcon: "ui-icon-scissors",
              },
              {
                title: "Copy <kbd>Ctrl-C</kbd>",
                cmd: "copy",
                uiIcon: "ui-icon-copy",
              },
              {
                title: "Paste as child<kbd>Ctrl+V</kbd>",
                cmd: "paste",
                uiIcon: "ui-icon-clipboard",
                disabled: true,
              },
            ],
            menuStyle: {
              fontSize: "12px" // adjust to a smaller value as needed
            },
            beforeOpen: function(event, ui) {
              var node = $.ui.fancytree.getNode(ui.target);
              $("#tree").contextmenu(
                "enableEntry",
                "paste",
                !!CLIPBOARD
              );
              node.setActive();
            },
            select: function(event, ui) {
              var that = this;
              // delay the event, so the menu can close and the click event does
              // not interfere with the edit control
              setTimeout(function() {
                $(that).trigger("nodeCommand", { cmd: ui.cmd });
              }, 100);
            },
          });

        } else {
          console.error('Failed to get decrypted data from the main process.');
        }
      });

          });
 

$(function() {

  fs.readFile('database.json', (err, data) => {
    if (err) throw err;
    data = JSON.parse(data);
    if(data.length>0){
      if(data[0].settings.hasOwnProperty('id')){
        if(data[0].settings.incognito == 1){
          const element = document.getElementById('main_file_setting_incognito_li');
          if(process.platform == 'win32'){
            element.classList.remove("simple");
            element.classList.add("checked");
          }
        }
      }
      if(data[0].settings.hasOwnProperty('timezone')){
          $('#timezone-select').val(data[0].settings.timezone);
          const utc = data[0].settings.timezone.split(/[+-]/);
          if (/[+]/.test(data[0].settings.timezone)){
            $('#timezone-label').html(`+${utc[1]}`);
          }
          else if (/[-]/.test(data[0].settings.timezone)){
            $('#timezone-label').html(`-${utc[1]}`);
          }
      }
    }
  });

{/* <li class="simple"><a href="#" class="text-decoration-none" id="main_file_save_tree">Tree Save State</a></li> */}
  $('#file_menu').html(`<button class="button flat-button small">File</button>
      <ul class="ribbon-dropdown" data-role="dropdown">
        <li class="simple"><a href="#" class="text-decoration-none" id="main_file_save">Save</a></li>
        <li class="simple"><a href="#" class="text-decoration-none" id="main_file_sort_selected">Sort Selected</a></li>
        <li class="simple"><a href="#" class="text-decoration-none" id="main_file_import">Import</a></li>
        <li class="simple"><a href="#" class="text-decoration-none" id="main_file_selective_export">Selective Export</a>
        </li>
        <li class="simple"><a href="#" class="text-decoration-none" id="main_file_backup">Backup Now</a></li>
        <li class="simple"><a href="#" class="text-decoration-none" id="main_file_notpad">Notepad</a></li>
        <li class="simple dropdown-toggle"><a href="#" class="text-decoration-none">Settings</a>
          <ul class="ribbon-dropdown" data-role="dropdown">
            <li class="simple" id="main_file_setting_topmost_li"><a href="#" class="text-decoration-none"
                id="main_file_setting_topmost">Topmost</a></li>
            <li class="simple"  id="main_file_start_system_window_li"><a href="#" id="main_file_start_system_window" class="text-decoration-none">Start With System</a>
            
            </li>
            <li class="simple" id="main_file_setting_incognito_li"><a href="#" class="text-decoration-none" id="main_file_setting_incognito">Incognito</a>
            </li>
            <li class="simple dropdown-toggle"><a href="#" class="text-decoration-none">Color Setting</a>
              <ul class="ribbon-dropdown" data-role="dropdown">
                <li class="simple dropdown-toggle"> <a href="#" class="text-decoration-none">Top Menu</a>
                  <ul class="ribbon-dropdown" data-role="dropdown">
                    <li class="simple" style="height: 30px;"><a href="#" class="text-decoration-none">
                      <span>
                        <input type="color" id="main_file_setting_color_top_menu" onclick="event.stopPropagation();"/>
                      </span></a>
                    </li>
                  </ul>
                </li>
                <li class="simple dropdown-toggle"> <a href="#" class="text-decoration-none">Main Dialog</a>
                  <ul class="ribbon-dropdown" data-role="dropdown">
                    <li class="simple" style="height: 30px;"><a href="#" class="text-decoration-none">
                      <span>
                        <input type="color" id="main_file_setting_color_main_dialog" onclick="event.stopPropagation();"/>
                      </span></a>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </li>
        <li class="simple"><a href="#" class="text-decoration-none" id="main_file_add_context_shortcut">Set Context Shortcut</a></li>
        <li class="simple"><a href="#" class="text-decoration-none" id="main_file_about">About</a></li>
        <li class="simple"><a href="#" class="text-decoration-none" id="main_file_exit">Exit</a></li>
      </ul>`);
    $('#add_menu').html(`<button class="button flat-button small">Add</button>
    <ul class="ribbon-dropdown" data-role="dropdown">
      <li class="simple"><a href="#" class="text-decoration-none" id="main_add_text">Text</a></li>
      <li class="simple"><a href="#" class="text-decoration-none" id="main_add_image">Image</a></li>
      <li class="simple"><a href="#" class="text-decoration-none" id="main_add_file">File</a></li>
      <li class="simple"><a href="#" class="text-decoration-none" id="main_add_folder">Folder</a></li>
      <li class="simple"><a href="#" id="add_current_datetime" class="text-decoration-none">Current Date and Time</a>
      </li>
      <li class="simple dropdown-toggle"><a href="#" class="text-decoration-none">From Excel</a>
        <ul class="ribbon-dropdown" data-role="dropdown">
          <li class="simple"><a href="#" class="text-decoration-none" id="main_add_excel_import_contacts">Import
              Contacts</a></li>
          <li class="simple"><a href="#" class="text-decoration-none" id="main_add_excel_import_ccredentials">Import
              Credentials</a></li>
          <li class="simple"><a href="#" class="text-decoration-none" id="main_add_excel_import_others">Import
              Others</a></li>
        </ul>
      </li>
    </ul>`);

  var platform = window.navigator.platform.toLowerCase();

  // Show the corresponding key list based on the operating system
  if (platform.includes('win')) {
    // Windows
    $('.mac').hide();
    $('.linux').hide();
  } else if (platform.includes('mac')) {
    // macOS
    $('.win').hide();
    $('.linux').hide();
  } else {
    // Linux or other
    $('.win').hide();
    $('.mac').hide();
  }

  $('#timezone-select').on('change', function() {
    var selectedOptionValue = $(this).val();
    $('#timezone-label').text((selectedOptionValue).replace('UTC', ''));
    ipcRenderer.send("saveTimeZone", selectedOptionValue); 
  });
  
  $('#add_current_datetime').click(function(){ 
    var tree = $.ui.fancytree.getTree("#tree"),
		node = tree.getRootNode();
    newData = {title: "Current Date and Time", data:{type: "date",timezone:$('#timezone-select').val()}};
    if( node )
    {
      newSibling = node.addChildren(newData);
    }
    else
    {
      $.ui.fancytree.getTree("#tree").getRootNode().addChildren(newData);
    }
    //  var node = $.ui.fancytree.getTree("#tree").getActiveNode();
    // if( !node ) return;
    // node.data.timezone = $('#timezone-select').val();
    // node.render(true);
    // saveTreeState();
        // Set a custom UTC timezone value
   // var customUtcOffset = $('#timezone-select').val().replace('UTC', '');
    // Create a Date object with the custom UTC timezone value
    //var customDate = new Date(Date.UTC(2023, 3, 26, 12, 0, 0) + (customUtcOffset * 60 * 60 * 1000));
    // Output the date and time in ISO format
    //console.log(customDate.toISOString());

    //node.setTitle(node.title + ", " + customDate); 
  });
    

    $('#main_file_save').click(function(){ 
      var tree = $.ui.fancytree.getTree("#tree");
      var da = tree.toDict(true);
      var d = JSON.stringify(da);
      const jsonObj = JSON.parse(d);
      const children = jsonObj.children;
      const newJsonStr = JSON.stringify(children);
      showSaveFileDialog(newJsonStr)
      

     });
     $('#main_file_save_tree').click(function(){ 
      
        saveTreeState();

     });
     
     $('#main_file_sort_selected').click(function(){ 
      var node = $.ui.fancytree.getTree("#tree").getActiveNode();
			var cmp = function(a, b) {
				a = a.title.toLowerCase();
				b = b.title.toLowerCase();
				return a > b ? 1 : a < b ? -1 : 0;
			};
			node.sortChildren(cmp, false);
    });

    $('#main_file_import').click(function(){ 
      ipcRenderer.invoke('import-data', 5)
      .then(result => {
        ipcRenderer.invoke('show-message-box', {
          type: 'question',
          buttons: ['Yes', 'No'],
          title: 'Confirmation',
          message: 'Are you sure you want to import this data?'
        }).then((response) => {
          if (response === 0) {
            // User clicked 'Yes' button
            console.log('User confirmed');
            $.ui.fancytree.getTree("#tree").reload(result).done(function(){
              ipcRenderer.invoke("saveData", JSON.stringify(result));
              alert("Data Imported");
            });
          } else {
            // User clicked 'No' button or closed the dialog
            console.log('User cancelled');
          }
        }).catch((err) => {
          console.log(err);
        });

      })
      .catch(error => {
        console.error(error)
      })
    });
    $('#main_file_selective_export').click(function(){
      var d = "";
      ipcRenderer.invoke("showSelectiveExportDialog", d); 
      //exportSelectedDialog();
      setTimeout(function(){
      
      }, 500);
    });
    $('#main_file_backup').click(function(){ 
      var tree = $.ui.fancytree.getTree("#tree");
      var da = tree.toDict(true);
      var d = JSON.stringify(da);
      const jsonObj = JSON.parse(d);
      const children = jsonObj.children;
      const newJsonStr = JSON.stringify(children);
      ipcRenderer.invoke("backupDialog", newJsonStr);
    
      
    });
    $('#main_file_notpad').click(function(){ 
      ipcRenderer.send("openTextEditor");
      
    });
    $('#main_file_setting_topmost').click(function(){
      const element = document.getElementById('main_file_setting_topmost_li');
      if (element.classList.contains("simple")) {
        // classList contains "simple", replace with "checked"
        if(process.platform == 'win32'){
          element.classList.remove("simple");
          element.classList.add("checked");
        }

      } else {
        // classList contains "checked", replace with "simple"
        if(process.platform == 'win32'){
          element.classList.remove("checked");
          element.classList.add("simple");
        }
      }
      console.log("Toggle button clicked");
      ipcRenderer.send("topmostToggle");
    });
    
    $('#main_file_start_system_window').click(function(){ 
      const element = document.getElementById('main_file_start_system_window_li');
      if (element.classList.contains("simple")) {
        if(process.platform == 'win32'){
          element.classList.remove("simple");
          element.classList.add("checked");
        }
        ipcRenderer.send("autoLaunchToggle", true); // Send enabled true
      } else {
        if(process.platform == 'win32'){
          element.classList.remove("checked");
          element.classList.add("simple");
        }
        ipcRenderer.send("autoLaunchToggle", false); // Send enabled false
      }
      console.log(" Toggle button clicked");
    });
    
   // Receive response from main process
    ipcRenderer.on("autoLaunchEnabled", (event, isEnabled) => {
      const element = document.getElementById('main_file_start_system_window_li');
      if (isEnabled) {
        if(process.platform == 'win32'){
          element.classList.remove("simple");
          element.classList.add("checked");
        }
      } else {
        if(process.platform == 'win32'){
          element.classList.remove("checked");
          element.classList.add("simple");
        }
      }
    });

    // Request auto-launch status from main process on app start
    ipcRenderer.send("requestAutoLaunchStatus");

    // $('#main_file_start_system_window').click(function(){ 
    //   const element = document.getElementById('main_file_start_system_window_li');
    //   if (element.classList.contains("simple")) {
    //     element.classList.remove("simple");
    //     element.classList.add("checked");
    //     ipcRenderer.send("autoLaunchToggle", true); // Enable auto-launch
    //   } else {
    //     element.classList.remove("checked");
    //     element.classList.add("simple");
    //     ipcRenderer.send("autoLaunchToggle", false); // Disable auto-launch
    //   }
    // });

    $('#main_file_setting_incognito').click(function(){ 
      const element = document.getElementById('main_file_setting_incognito_li');
      if (element.classList.contains("simple")) {
        // classList contains "simple", replace with "checked"
        if(process.platform == 'win32'){
          element.classList.remove("simple");
          element.classList.add("checked");
        }
        ipcRenderer.send("incognitoToggle", "1");

      } else {
        // classList contains "checked", replace with "simple"
        element.classList.remove("checked");
        element.classList.add("simple");
        ipcRenderer.send("incognitoToggle", "0");
      }
      
    });
  

    $('#main_file_setting_color_top_menu').on('change', function() {
      const colorPicker = this;
      console.log($(colorPicker).val());
      $('#top-main-menu').css('background-color', $(colorPicker).val());
    });

    $('#main_file_setting_color_main_dialog').on('change', function() {
      const colorPicker = this;
      console.log($(colorPicker).val());
      $('#tree').find('.fancytree-container').css('background-color', $(colorPicker).val());
      // Invert color of text inside .fancytree-title
      $('#tree').find('.fancytree-title').css('color', invertColor($(colorPicker).val()));
      //$('.fancytree-title').css('color', invertColor($(colorPicker).val()));
    });

    $('#main_file_about').click(function(){ 
      openAboutDialog();
    });
    
    $('#main_file_exit').click(function(){ 
      ipcRenderer.send('close-window');
    });
    $('#main_add_input').click(function(){ 
      var tree = $.ui.fancytree.getTree("#tree"),
				node = tree.getActiveNode();
				newData = {title: "...", data:{type: "text"}};
        if( node )
        {
				  newSibling = node.addChildren(newData);
        }
        else
        {
          $.ui.fancytree.getTree("#tree").getRootNode().addChildren(newData);
        }
    });
    $('#main_add_parent').click(function(){ 
      var tree = $.ui.fancytree.getTree("#tree"),
				node = tree.getRootNode();
				newData = {title: "...", data:{type: "text"}};
        if( node )
        {
				  newSibling = node.addChildren(newData);
        }
        else
        {
          $.ui.fancytree.getTree("#tree").getRootNode().addChildren(newData);
        }
    });
    $('#main_remove').click(function(){
      var node = $.ui.fancytree.getTree("#tree").getActiveNode();
      if( !node ) return;
      if (node.data && "shortcutKeys" in node.data) {
        var shortcutKey = node.data.shortcutKeys;
        removeShortcutkey(shortcutKey);
      }
      node.remove(); 

    });
    $('#main_add_text').click(function(){ 

      var tree = $.ui.fancytree.getTree("#tree"),
				node = tree.getActiveNode();
				newData = {title: "...", data:{type: "text"}};
        if( node )
        {
				  newSibling = node.addChildren(newData);
          //newSibling.extraClasses = "custom1";
         // newSibling.renderTitle();
          //newSibling.icon = "blank.png";
          //newSibling.renderTitle();
        }
        else
        {
          newnode = $.ui.fancytree.getTree("#tree").getRootNode().addChildren(newData);
         // newnode.extraClasses = "custom1";
         // newnode.renderTitle();
         // newnode.icon = "blank.png";
         // newnode.renderTitle();
        }
    });
    $('#main_add_image').click(function(){ 
      getImgFileFolder('image');

    });
    $('#main_add_file').click(function(){ 
      getImgFileFolder('file');
    });
    $('#main_add_folder').click(function(){ 
      getImgFileFolder('folder');
    });
    $('#main_add_excel_import_contacts').click(function(){ 
     getExcelData(false);
    });
    $('#main_add_excel_import_ccredentials').click(function(){ 
      getExcelData(true);
    });
    $('#main_add_excel_import_others').click(function(){ 
      getExcelData(false);
    });
    $('#main_refresh').click(function(){ 
      var filePath = path.join(__dirname, 'tree-data.json');
        $.ajax({
            type: "GET",
            dataType: 'json',
            async: false,
            url: filePath,
            success: function(data) {
                var tree = $.ui.fancytree.getTree("#tree");
                tree.reload(data);
                // $("input[name=search]").click(function() {
                //   $(this).focus();
                // });
                alert("Reloaded Successfully!");
            },
            error: function() {
                alert("Error while Reloading!");
            }
        });
    });
    $('#searchbtn').on('click',function(){
      if($('.search-dropdown').is(':hidden')){
        $('.search-dropdown').show();
          $("input[name=search]").focus();
      }
      else{
        $('.search-dropdown').hide();
      }
    });
    
    
    $('#main_assign_shortcut').click(function(){ 
      var node = $.ui.fancytree.getTree("#tree").getActiveNode();
      var modifierkey = $('#modifierkey-select').val();
      var keyboardkey = $('#keyboardkey-select').val();
      if (!node) {
        alert("Select a node First!");
      } else if (!modifierkey) {
        alert("Select a Modifier Key First!");
      } else if (!keyboardkey) {
        alert("Select a Keyboard Key First!");
      } else {
        var newShortcutKey = modifierkey + "+"+ keyboardkey;
        // Send a message to the main process to check if a global shortcut is registered
        ipcRenderer.invoke('check-global-shortcut', newShortcutKey).then((isRegistered) => {
          if (isRegistered) {
            alert("This Key already Registered in the System Try Some New Combination");
          } else {
            // Register a global shortcut
            ipcRenderer.invoke('register-shortcut', newShortcutKey).then((ret) => {
              if (ret) {
                alert('Shortcut key registered successfully');
                //node.setTitle(node.title + "  --(" + newShortcutKey + ")");
                node.data.shortcutKeys = newShortcutKey;
                node.render(true);
                setTimeout(function() {
                  saveTreeState();
                }, 500);
              } else {
                alert('Shortcut key registration failed');
              }
            });
          }
        });
      }
    });

    $('#main_file_add_context_shortcut').click(function(){ 
      var modifierkey = $('#modifierkey-select').val();
      var keyboardkey = $('#keyboardkey-select').val();
      if (!modifierkey) {
        alert("Select a Modifier Key First!");
      } else if (!keyboardkey) {
        alert("Select a Keyboard Key First!");
      } else {
        var newShortcutKey = modifierkey + "+"+ keyboardkey;
        // Send a message to the main process to check if a global shortcut is registered
        ipcRenderer.invoke('check-global-shortcut', newShortcutKey).then((isRegistered) => {
          if (isRegistered) {
            alert("This Key already Registered in the System Try Some New Combination");
          } else {
            // Register a global shortcut
            ipcRenderer.invoke('register-context-shortcut', newShortcutKey).then((ret) => {
              if (ret) {
                alert('Shortcut key registered successfully');
              } else {
                alert('Shortcut key registration failed');
              }
            });
          }
        });
      }
    });
});

function logEvent(event, data, msg){
  msg = msg ? ": " + msg : "";
  $.ui.fancytree.info("Event('" + event.type + "', node=" + data.node + ")" + msg);
}
function showSaveFileDialog(d) {
ipcRenderer.invoke("showDialog", d);
}

function openChildClickValueDialog(node){
  Metro.dialog.create({
      title: "Input",
      content: '<p>Enter the path to</p>'+
      '<textarea id="dialogInput" data-role="textarea" data-default-value="'+node.title+'"></textarea>',
      actions: [
          {
              caption: "Save",
              cls: "js-dialog-close alert",
              onclick: function(){
                  //node.title = ;
                  node.setTitle($('#dialogInput').val());
                  //treeDataChangeEvent();
                  console.log("You clicked Save action the value changed");
              }
          },
          {
              caption: "Cancel",
              cls: "js-dialog-close",
              onclick: function(){
                  console.log("You clicked Cancel action");
              }
          }
      ]
  });

  $("#dialogInput").keydown(function(event) {
    if (event.keyCode === 13) { // Enter key
      event.preventDefault();
      $(".js-dialog-close.alert").trigger("click"); // Trigger the click event on the Save button
    }
  });
}


function openAboutDialog(){
  Metro.dialog.create({
      title: "About",
      content: '<div class="description">'+
      '        Read Below:'+
      '         <ul>'+
      '           <li>re-order nodes using drag-and-drop.</li>'+
      '           <li>'+
      '             inline editing.<br />'+
      '             Try <kbd>F2</kbd> to rename a node.<br />'+
      '             <kbd>Ctrl+N</kbd>, <kbd>Ctrl+Shift+N</kbd> to add nodes'+
      '             (Quick-enter: add new nodes until [enter] is hit on an empty'+
      '             title).'+
      '           </li>'+
      '           <li>'+
      '             Extended keyboard shortcuts:<br />'+
      '             <kbd>Ctrl+C</kbd>, <kbd>Ctrl+X</kbd>, <kbd>Ctrl+V</kbd> for'+
      '             copy/paste,<br />'+
      '             <kbd>Ctrl+UP</kbd>, <kbd>Ctrl+DOWN</kbd>,'+
      '             <kbd>Ctrl+LEFT</kbd>, <kbd>Ctrl+RIGHT</kbd>'+
      '             to move nodes around and change indentation.<br>'+
      '             (On macOS, add <kbd>Shift</kbd> to the keystrokes.)'+
      '           </li>'+
      '           <li>'+
      '             <a href="#">contextmenu</a>'+
      '             for additional edit commands'+
      '           </li>'+
      '         </ul>'+
      '       </div>',
      actions: [
          {
              caption: "Done",
              cls: "js-dialog-close alert",
              onclick: function(){
                  //node.title = ;
                  //node.setTitle($('#dialogInput').val());
                  console.log("You clicked Done action on about");
              }
          }
          // ,
          // {
          //     caption: "Cancel",
          //     cls: "js-dialog-close",
          //     onclick: function(){
          //         console.log("You clicked Cancel action");
          //     }
          // }
      ]
  });
}


// function initializetree2()
// {
        
//   $("#tree2").fancytree({
//             activeVisible: true, // Make sure, active nodes are visible (expanded)
//             aria: true, // Enable WAI-ARIA support
//             autoActivate: true, // Automatically activate a node when it is focused using keyboard
//             autoCollapse: false, // Automatically collapse all siblings, when a node is expanded
//             autoScroll: false, // Automatically scroll nodes into visible area
//             clickFolderMode: 4, // 1:activate, 2:expand, 3:activate and expand, 4:activate (dblclick expands)
//             checkbox: true, // Show check boxes
//             checkboxAutoHide: false, // Display check boxes on hover only
//             debugLevel: 4, // 0:quiet, 1:errors, 2:warnings, 3:infos, 4:debug
//             disabled: false, // Disable control
//             focusOnSelect: false, // Set focus when node is checked by a mouse click
//             escapeTitles: false, // Escape `node.title` content for display
//             generateIds: false, // Generate id attributes like <span id='fancytree-id-KEY'>
//             idPrefix: "ft2_", // Used to generate node idÂ´s like <span id='fancytree-id-<key>'>
//             icon: false, // Display node icons
//             keyboard: true, // Support keyboard navigation
//             keyPathSeparator: "/", // Used by node.getKeyPath() and tree.loadKeyPath()
//             minExpandLevel: 1, // 1: root node is not collapsible
//             rtl: false, // Enable RTL (right-to-left) mode
//             selectMode: 2, // 1:single, 2:multi, 3:multi-hier
//             tabindex: "0", // Whole tree behaves as one single control
//             tooltip: false, // Use title as tooltip (also a callback could be specified)
//             titlesTabbable: true, // Add all node titles to TAB chain// Node titles can receive keyboard focus
//             quicksearch: true, // Jump to nodes when pressing first character///must true for filter 
            
//             source: { url: "tree-data.json" },

//             modifyChild: function(event, data) {
//               data.tree.info(event.type, data);
//             },

//             // --- Node events -------------------------------------------------
//             activate: function(event, data) {
//               logEvent(event, data);
//               var node = data.node;
//               // acces node attributes
//               $("#echoActive").text(node.title);
//               if( !$.isEmptyObject(node.data) ){
//               }
//             },
//             beforeActivate: function(event, data) {
//               logEvent(event, data, "current state=" + data.node.isActive());
//               // return false to prevent default behavior (i.e. activation)
//               //              return false;
//             },
//             beforeExpand: function(event, data) {
//               logEvent(event, data, "current state=" + data.node.isExpanded());
//               // return false to prevent default behavior (i.e. expanding or collapsing)
//               //				return false;
//             },
//             beforeSelect: function(event, data) {
//               //				console.log("select", event.originalEvent);
//               logEvent(event, data, "current state=" + data.node.isSelected());
//               // return false to prevent default behavior (i.e. selecting or deselecting)
//               //				if( data.node.isFolder() ){
//               //					return false;
//               //				}
//             },
//             blur: function(event, data) {
//               logEvent(event, data);
//               $("#echoFocused").text("-");
//             },
//             click: function(event, data) {
//               logEvent(event, data, ", targetType=" + data.targetType);
//               // return false to prevent default behavior (i.e. activation, ...)
//               //return false;
//             },
//             collapse: function(event, data) {
//               logEvent(event, data);
//             },
//             createNode: function(event, data) {
//               // Optionally tweak data.node.span or bind handlers here
//               logEvent(event, data);
//             },

//             expand: function(event, data) {
//               logEvent(event, data);
//             },
//             enhanceTitle: function(event, data) {
//               logEvent(event, data);
//             },
//             focus: function(event, data) {
//               logEvent(event, data);
//               $("#echoFocused").text(data.node.title);
//             },
//             keydown: function(event, data) {
//               logEvent(event, data);
//               switch( event.which ) {
//               case 32: // [space]
//                 data.node.toggleSelected();
//                 return false;
//               }
//             },
//             keypress: function(event, data) {
//               // currently unused
//               logEvent(event, data);
//             },
//             loadChildren: function(event, data) {
//               logEvent(event, data);
//             },
//             loadError: function(event, data) {
//               logEvent(event, data);
//             },
           
//             renderNode: function(event, data) {
//               // Optionally tweak data.node.span
//               //              $(data.node.span).text(">>" + data.node.title);
//               logEvent(event, data);
//             },
//             renderTitle: function(event, data) {
//               // NOTE: may be removed!
//               // When defined, must return a HTML string for the node title
//               logEvent(event, data);
//               //				return "new title";
//             },
//             select: function(event, data) {
//               logEvent(event, data, "current state=" + data.node.isSelected());
//               var s = data.tree.getSelectedNodes().join(", ");
//               $("#echoSelected").text(s);
//             }
//           })
//           .on("fancytreeactivate", function(event, data){
//             // alternative way to bind to 'activate' event
//             //		    logEvent(event, data);
//           });
// }

// function treeDataChangeEvent(){
//   if ($.ui.fancytree && $.ui.fancytree.getTree("#tree") && $.ui.fancytree.getTree("#tree").getNodes().length > 0) {
//     // Fancytree is initialized and data is loaded
//    // alert("hahahahahaahh");
//     var tree = $.ui.fancytree.getTree("#tree");
//     var da = tree.toDict(true);
//     var d = JSON.stringify(da);
//     ipcRenderer.invoke("saveData", d);
//   } else {
//     // Fancytree is not initialized or data is not loaded
//   }
 
// }

function convertCredentialToTreeNodes(data) {
  const rootNode = {title: 'Root', children: []};
  let mainNode = null;
  let passwordNode = null;

  for (let i = 0; i < data.length; i++) {
    let row = data[i];

    // Column 1: main node
    let mainValue = row[0];
    if (mainValue) {
      mainNode = {title: mainValue, children: []};
      rootNode.children.push(mainNode);
      passwordNode = null;
    }

    // Column 2: child of main
    let childValue = row[1];
    if (childValue) {
      let childNode = {title: childValue, children: []};
      mainNode.children.push(childNode);
      passwordNode = null;
    }

    // Column 3: child of main
    let child2Value = row[2];
    if (child2Value) {
      let child2Node = {title: child2Value, children: []};
      mainNode.children.push(child2Node);
      passwordNode = null;
    }

    // Password node child of main
    if (row[3] && !passwordNode) {
      passwordNode = {title: 'Password', children: []};
      mainNode.children.push(passwordNode);
    }

    // Column 4: child of password
    let child3Value = row[3];
    if (child3Value && passwordNode) {
      let child3Node = {title: child3Value};
      passwordNode.children.push(child3Node);
    }
  }

  return rootNode.children;
}


function getExcelData(isCredentials)
{
    ipcRenderer.invoke('get-excel-data', 5)
    .then(result => {
      var data;
      if(isCredentials)
      {data = convertCredentialToTreeNodes(result);}
      else
      {data = convertToTreeNodes(result);}
      var tree = $.ui.fancytree.getTree("#tree"),
      node = tree.getActiveNode();
      if( node )
      { newSibling = node.addChildren(data);      }
      else
      { newnode = $.ui.fancytree.getTree("#tree").getRootNode().addChildren(data);}
      console.log(data) 
    })
    .catch(error => {
      console.error(error)
    })
}

function convertToTreeNodes(data) {
  const rootNode = {title: 'Root', children: []};

  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    let parent = rootNode;
    
    for (let j = 0; j < row.length; j++) {
      let columnValue = row[j];
      
      if (!columnValue) {
        // Ignore empty cells
        continue;
      }
      
      let existingNode = findNodeByTitle(parent, columnValue);
      
      if (existingNode) {
        // If node already exists, use it as the parent for the next column
        parent = existingNode;
      } else {
        // Otherwise, create a new node and add it to the parent
        let newNode = {title: columnValue, children: []};
        parent.children.push(newNode);
        parent = newNode;
      }
    }
  }

  return rootNode.children;
}

function findNodeByTitle(node, title) {
  if (node.title === title) {
    return node;
  } else {
    for (let i = 0; i < node.children.length; i++) {
      let foundNode = findNodeByTitle(node.children[i], title);
      
      if (foundNode) {
        return foundNode;
      }
    }
    
    return null;
  }
}

function getImgFileFolder(type)
{
  ipcRenderer.invoke('get-file-folder', type)
  .then(result => {
    var tree = $.ui.fancytree.getTree("#tree"),
    node = tree.getActiveNode();
    if( node )
    { newSibling = node.addChildren(result);      }
    else
    { newnode = $.ui.fancytree.getTree("#tree").getRootNode().addChildren(result);}
    console.log(result) 
  })
  .catch(error => {
    console.error(error)
  })
}

function editImgFileFolder(node)
{
  console.log(JSON.parse(node));
  // ipcRenderer.invoke('edit-file-folder',  node.path , node.title, node.type)
  // .then(result => {
  //   if( node.data.icon != "error.png" )
  //   {  node.data.path = result.path;
  //     node.data.title = result.title;
  //     node.data.icon = result.icon;
  //     alert("Node "+node.type.toUpperCase()+" Updated");
  //   }
  //   console.log(result) 
  // })
  // .catch(error => {
  //   console.error(error)
  // })
}

function rgbToHex(rgb) {
  const matches = rgb.match(/rgb\((\d+), (\d+), (\d+)\)/);
  if (!matches) {
    return null;
  }
  const r = parseInt(matches[1], 10).toString(16).padStart(2, '0');
  const g = parseInt(matches[2], 10).toString(16).padStart(2, '0');
  const b = parseInt(matches[3], 10).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

function invertColor(hex) {
  // Convert hex color code to RGB format
  var r = parseInt(hex.substring(1,3), 16);
  var g = parseInt(hex.substring(3,5), 16);
  var b = parseInt(hex.substring(5,7), 16);

  // Invert each color channel
  r = 255 - r;
  g = 255 - g;
  b = 255 - b;

  // Convert back to hex format
  return "#" + r.toString(16) + g.toString(16) + b.toString(16);
}

function saveTreeState(){
  var tree = $.ui.fancytree.getTree("#tree");
  var da = tree.toDict(true);
  var d = JSON.stringify(da);
  const jsonObj = JSON.parse(d);
  const children = jsonObj.children;
  const newJsonStr = JSON.stringify(children);
  console.log(newJsonStr);
  ipcRenderer.invoke("saveData", newJsonStr);
}


function removeShortcutkey(shortcutKey)
{
    // Send a message to the main process to check if a global shortcut is registered
    ipcRenderer.invoke('check-global-shortcut', shortcutKey).then((isRegistered) => {
      if (isRegistered) {
        
        ipcRenderer.invoke('unregister-shortcut', shortcutKey).then((ret) => {
          if (ret) {
            alert('Shortcut key UnRegistered successfully');
          } else {
            alert('Shortcut key removal failed');
          }
        });

      } else {
        console.log("Shortcut Command not found!")
      }
    });
}