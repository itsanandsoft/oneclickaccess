const $ = require('jquery');
require('jquery.fancytree');
require('jquery.fancytree/dist/modules/jquery.fancytree.dnd5.js');
require('jquery.fancytree/dist/modules/jquery.fancytree.edit.js');
require('jquery.fancytree/dist/modules/jquery.fancytree.gridnav.js');
require('jquery.fancytree/dist/modules/jquery.fancytree.table.js');
require('jquery.fancytree/dist/modules/jquery.fancytree.filter.js');
require('ui-contextmenu');
const { ipcRenderer } = require("electron");
// $('#tree').fancytree({
//     skin: 'skin-win8',
//     source: [
//         {title: 'Node 1',key: '1'},
//         {title: 'Node 2', children: [
//             {title: 'Subnode 2.1'},
//             {title: 'Subnode 2.2'}
//         ]}
//       ],
// });

//   var tree = $.ui.fancytree.getTree("#tree");

//   // Expand all tree nodes
//   tree.visit(function(node){
//     node.setExpanded(true);
//   });

// // Get a reference to the node
// const myNode = tree.getNodeByKey('1');

// // Check if the node exists before adding children
// if (myNode) {
//   myNode.addChildren([{ title: 'Child Node 3' }, { title: 'Child Node 4' }]);
// }


    var CLIPBOARD = null;

      $(function() {
        $("#tree")
          .fancytree({
            activeVisible: true, // Make sure, active nodes are visible (expanded)
            aria: true, // Enable WAI-ARIA support
            autoActivate: true, // Automatically activate a node when it is focused using keyboard
            autoCollapse: false, // Automatically collapse all siblings, when a node is expanded
            autoScroll: false, // Automatically scroll nodes into visible area
            clickFolderMode: 4, // 1:activate, 2:expand, 3:activate and expand, 4:activate (dblclick expands)
            checkbox: false, // Show check boxes
            checkboxAutoHide: true, // Display check boxes on hover only
            debugLevel: 4, // 0:quiet, 1:errors, 2:warnings, 3:infos, 4:debug
            disabled: false, // Disable control
            focusOnSelect: false, // Set focus when node is checked by a mouse click
            escapeTitles: false, // Escape `node.title` content for display
            generateIds: false, // Generate id attributes like <span id='fancytree-id-KEY'>
            idPrefix: "ft_", // Used to generate node idÂ´s like <span id='fancytree-id-<key>'>
            icon: true, // Display node icons
            keyboard: true, // Support keyboard navigation
            keyPathSeparator: "/", // Used by node.getKeyPath() and tree.loadKeyPath()
            minExpandLevel: 1, // 1: root node is not collapsible
            rtl: false, // Enable RTL (right-to-left) mode
            selectMode: 1, // 1:single, 2:multi, 3:multi-hier
            tabindex: "0", // Whole tree behaves as one single control
            tooltip: false, // Use title as tooltip (also a callback could be specified)
            titlesTabbable: true, // Add all node titles to TAB chain// Node titles can receive keyboard focus
            quicksearch: true, // Jump to nodes when pressing first character///must true for filter 
            
            source: { url: "tree-data.json" },

            extensions: ["edit", "dnd5", "filter"],//, "table", "gridnav"

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
              mode: "dimm"       // Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
            },
        
            lazyLoad: function(event, data) {
              data.result = {url: "ajax-sub2.json"}
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
          
            // table: {
            //   indentation: 20,
            //   nodeColumnIdx: 2,
            //   checkboxColumnIdx: 0,
            // },
            // gridnav: {
            //   autofocusInput: false,
            //   handleCursorKeys: true,
            // },

            // lazyLoad: function(event, data) {
            //   data.result = { url: "ajax-sub2.json" };
            // },
            createNode: function(event, data) {
              var node = data.node,
                $tdList = $(node.tr).find(">td");

              // Span the remaining columns if it's a folder.
              // We can do this in createNode instead of renderColumns, because
              // the `isFolder` status is unlikely to change later
              if (node.isFolder()) {
                $tdList
                  .eq(2)
                  .prop("colspan", 6)
                  .nextAll()
                  .remove();
              }
            },
            renderColumns: function(event, data) {
              var node = data.node,
                $tdList = $(node.tr).find(">td");

              // (Index #0 is rendered by fancytree by adding the checkbox)
              // Set column #1 info from node data:
              $tdList.eq(1).text(node.getIndexHier());
              // (Index #2 is rendered by fancytree)
              // Set column #3 info from node data:
              $tdList
                .eq(3)
                .find("input")
                .val(node.key);
              $tdList
                .eq(4)
                .find("input")
                .val(node.data.foo);

              // Static markup (more efficiently defined as html row template):
              // $tdList.eq(3).html("<input type='input' value='"  "" + "'>");
              // ...
            },
            // renderColumns: function(event, data) {
            //   var node = data.node,
            //     $tdList = $(node.tr).find(">td");
            //   // (index #0 is rendered by fancytree by adding the checkbox)
            //   $tdList.eq(1).text(node.getIndexHier()).addClass("alignRight");
            //   // (index #2 is rendered by fancytree)
            //   $tdList.eq(3).text(node.key);
            //   // $tdList.eq(4).html("<input type='checkbox' name='like' value='" + node.key + "'>");
            // }
            modifyChild: function(event, data) {
              data.tree.info(event.type, data);
            },

            //events
            // --- Tree events -------------------------------------------------
            blurTree: function(event, data) {
              logEvent(event, data);
            },
            create: function(event, data) {
              logEvent(event, data);
            },
            init: function(event, data, flag) {
              logEvent(event, data, "flag=" + flag);
            },
            focusTree: function(event, data) {
              logEvent(event, data);
            },
            restore: function(event, data) {
              logEvent(event, data);
            },
            // --- Node events -------------------------------------------------
            activate: function(event, data) {
              logEvent(event, data);
              var node = data.node;
              // acces node attributes
              $("#echoActive").text(node.title);
              if( !$.isEmptyObject(node.data) ){
      //					alert("custom node data: " + JSON.stringify(node.data));
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
            dblclick: function(event, data) {
              logEvent(event, data);
              var node = $.ui.fancytree.getTree("#tree").getActiveNode();
              if( node ){
                openChildClickValueDialog(node);
                console.log("Currently active: " + node.title);
              }else{
                console.log("No active node.");
              }
      //				data.node.toggleSelect();
            },
            deactivate: function(event, data) {
              logEvent(event, data);
              $("#echoActive").text("-");
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
            lazyLoad: function(event, data) {
              logEvent(event, data);
              // return children or any other node source
              data.result = {url: "ajax-sub2.json"};
      //				data.result = [
      //					{title: "A Lazy node", lazy: true},
      //					{title: "Another node", selected: true}
      //					];
            },
            loadChildren: function(event, data) {
              logEvent(event, data);
            },
            loadError: function(event, data) {
              logEvent(event, data);
            },
            modifyChild: function(event, data) {
              logEvent(event, data, "operation=" + data.operation +
                ", child=" + data.childNode);
            },
            postProcess: function(event, data) {
              logEvent(event, data);
              // either modify the Ajax response directly
              data.response[0].title += " - hello from postProcess";
              // or setup and return a new response object
      //				data.result = [{title: "set by postProcess"}];
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
          }).on("mouseenter mouseleave", ".fancytree-title", function(event){
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

            /*
            * Event handlers for our little demo interface
            */
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

        /*
         * Tooltips
         */
        // $("#tree").tooltip({
        //   content: function () {
        //     return $(this).attr("title");
        //   }
        // });

        /*
         * Context menu (https://github.com/mar10/jquery-ui-contextmenu)
         */
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
      });










$(function(){
	// addSampleButton({
	// 	label: "Disable",
	// 	id: "btnDisable",
	// 	code: function(){
	// 		var tree = $.ui.fancytree.getTree("#tree"),
	// 			wasEnabled = !tree.options.disabled;

	// 		tree.enable(!wasEnabled);
	// 		$("#btnDisable").text(wasEnabled ? "Enable" : "Disable");
	// 	}
	// });
	// addSampleButton({
	// 	label: "Expand all",
	// 	newline: false,
	// 	code: function(){
	// 		$.ui.fancytree.getTree("#tree").expandAll();
	// 	}
	// });
	// addSampleButton({
	// 	label: "Collapse all",
	// 	newline: false,
	// 	code: function(){
	// 		$.ui.fancytree.getTree("#tree").expandAll(false);
	// 	}
	// });
	// addSampleButton({
	// 	label: "Toggle expand",
	// 	code: function(){
	// 		$.ui.fancytree.getTree("#tree").visit(function(node){
	// 			node.toggleExpanded();
	// 		});
	// 	}
	// });
	addSampleButton({
		label: "tree.getActiveNode()",
		newline: false,
		code: function(){
			var node = $.ui.fancytree.getTree("#tree").getActiveNode();
			if( node ){
				alert("Currently active: " + node.title);
			}else{
				alert("No active node.");
			}
		}
	});
	addSampleButton({
		label: "tree.toDict()",
		code: function(){
			// Convert the whole tree into an dictionary
			var tree = $.ui.fancytree.getTree("#tree");
			var d = tree.toDict(true);
			alert(JSON.stringify(d));
		}
	});
	addSampleButton({
		label: "activateKey('id4.3.2')",
		code: function(){
			$.ui.fancytree.getTree("#tree").activateKey("id4.3.2");
			// also possible:
//	              $.ui.fancytree.getTree("#tree").getNodeByKey("id4.3.2").setActive();
		}
	});
	addSampleButton({
		label: "setTitle()",
		code: function(){
			var node = $.ui.fancytree.getTree("#tree").getActiveNode();
			if( !node ) return;
			node.setTitle(node.title + ", " + new Date());
			// this is a shortcut for
			// node.fromDict({title: data.node.title + new Date()});
		}
	});
	addSampleButton({
		label: "Sort tree",
		newline: false,
		code: function(){
			var node = $.ui.fancytree.getTree("#tree").getRootNode();
			node.sortChildren(null, true);
		}
	});
	
	addSampleButton({
		header: "Create nodes",
		tooltip: "Use node.addChildren() with single objects",
		label: "Add single nodes",
		newline: false,
		code: function(){
			// Sample: add an hierarchic branch using code.
			// This is how we would add tree nodes programatically
			var rootNode = $.ui.fancytree.getTree("#tree").getRootNode();
			var childNode = rootNode.addChildren({
				title: "Programatically addded nodes",
				tooltip: "This folder and all child nodes were added programmatically.",
				folder: true
			});
			childNode.addChildren({
				title: "Document using a custom icon",
				icon: "customdoc1.gif"
			});
		}
	});
	addSampleButton({
		tooltip: "Use node.appendSibling()",
		label: "Apppend a sibling node",
		newline: false,
		code: function(){
			var tree = $.ui.fancytree.getTree("#tree"),
				node = tree.getActiveNode(),
				newData = {title: "New Node"},
				newSibling = node.appendSibling(newData);
		}
	});
	// addSampleButton({
	// 	label: "ROOT.addChildren()",
	// 	tooltip: "Use node.addChildren() with recursive arrays",
	// 	code: function(){
	// 		// Sample: add an hierarchic branch using an array
	// 		var obj = [
	// 			{ title: "Lazy node 1", lazy: true },
	// 			{ title: "Lazy node 2", lazy: true },
	// 			{ title: "Folder node 3", folder: true,
	// 				children: [
	// 					{ title: "node 3.1" },
	// 					{ title: "node 3.2",
	// 						children: [
	// 							{ title: "node 3.2.1" },
	// 							{ title: "node 3.2.2",
	// 								children: [
	// 									{ title: "node 3.2.2.1" }
	// 								]
	// 							}
	// 						]
	// 					}
	// 				]
	// 			}
	// 		];
	// 		$.ui.fancytree.getTree("#tree").getRootNode().addChildren(obj);
	// 	}
	// });
	addSampleButton({
		label: "node.fromDict()",
		code: function(){
			var node = $.ui.fancytree.getTree("#tree").getActiveNode();
			if( !node ) return;
			// Set node data and - optionally - replace children
			node.fromDict({
				title: node.title + new Date(),
				children: [{title: "t1"}, {title: "t2"}]
			});
		}
	});
	CLIPBOARD = null;
	addSampleButton({
		label: "Clipboard = node.toDict()",
		newline: false,
		code: function(){
			// Convert active node (and descendants) to a dictionary and store
			// in
			var node = $.ui.fancytree.getTree("#tree").getActiveNode();
			var d = node.toDict(true, function(dict, node){
				// Remove keys, so they will be re-generated when this dict is
				// passed to addChildren()
				delete dict.key;
			});
			// Store in a globael variable
			CLIPBOARD = d;
			alert("CLIPBOARD = " + JSON.stringify(d));
		}
	});
	addSampleButton({
		label: "node.fromDict(Clipboard)",
		code: function(){
			var node = $.ui.fancytree.getTree("#tree").getActiveNode();
			if( !node ) return;
			// Set node data and - optionally - replace children
			node.fromDict(CLIPBOARD);
		}
	});
	addSampleButton({
		label: "Remove selected nodes (but keep children)",
		newline: true,
		code: function(){
			var tree = $.ui.fancytree.getTree("#tree"),
				selNodes = tree.getSelectedNodes();

			selNodes.forEach(function(node) {
				while( node.hasChildren() ) {
					node.getFirstChild().moveTo(node.parent, "child");
				}
				node.remove();
			});
		}
	});




  ///filter buttons
  addSampleButton({
    label: "Filter active branch",
    newline: false,
    code: function(){
      if( !tree.getActiveNode() ) {
        alert("Please activate a folder.");
        return;
      }
      tree.filterBranches(function(node){
        return node.isActive();
      }, {
        mode: "hide",
      });
    }
  });
  addSampleButton({
    label: "Reset filter",
    newline: false,
    code: function(){
      tree.clearFilter();
    }
  });




  addSampleButton({
    label: "destroy all",
    newline: false,
    code: function(){
      $(":ui-fancytree").fancytree("destroy");
    }
  });
  addSampleButton({
    label: "init all",
    newline: false,
    code: function(){
      $(".sampletree").fancytree();
    }
  });
  addSampleButton({
    label: "Reload() #1",
    newline: false,
    code: function(){
      $.ui.fancytree.getTree("#tree").reload([
        {title: "node1"},
        {title: "node2"}
      ]).done(function(){
        alert("reloaded");
      });
    }
  });
  addSampleButton({
    label: "Set 'source' option (all)",
    newline: false,
    code: function(){
      $(".sampletree").fancytree("option", "source", [
        {title: "node1"}
      ]);
    }
  });



  addSampleButton({
		label: "(De)Select active node",
		newline: false,
		code: function(){
			var node = $.ui.fancytree.getTree("#tree").getActiveNode();
			node.setSelected( !node.isSelected() );
		}
	});
	addSampleButton({
		label: "Remove active node",
		newline: false,
		code: function(){
			var node = $.ui.fancytree.getTree("#tree").getActiveNode();
			node.remove();
		}
	});

});

function logEvent(event, data, msg){
  //        var args = Array.isArray(args) ? args.join(", ") :
      msg = msg ? ": " + msg : "";
      $.ui.fancytree.info("Event('" + event.type + "', node=" + data.node + ")" + msg);
    }

    function showSaveFileDialog(d) {
      ipcRenderer.invoke("showDialog", d);
    }

$(function() {

  
  $('#add_current_datetime').click(function(){ 
     var node = $.ui.fancytree.getTree("#tree").getActiveNode();
    if( !node ) return;
    node.setTitle(node.title + ", " + new Date()); });

    $('#main_file_save').click(function(){ 
      
      var tree = $.ui.fancytree.getTree("#tree");
			var d = tree.toDict(true);
      showSaveFileDialog(JSON.stringify(d))
      

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
    });
    $('#main_file_selective_export').click(function(){ 
      exportSelectedDialog();
      setTimeout(function(){
        initializetree2();
      }, 500);
    });
    $('#main_file_backup').click(function(){ 
    });
    $('#main_file_notpad').click(function(){ 
    });
    $('#main_file_setting_topmost').click(function(){ 
    });
    $('#main_file_start_system_window').click(function(){ 
    });
    $('#main_file_setting_incognito').click(function(){ 
    });
    $('#main_file_setting_color_top_menu').click(function(){
      openColorTopMenuDialog(); 
      setTimeout(function(){
       // initializetree2();
      }, 500);
      
      
    });
    $('#main_file_setting_color_main_dialog').click(function(){
      openColorDialog(); 
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
				newData = {title: "..."};
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
			node.remove(); 
    });
    $('#main_add_text').click(function(){ 
    });
    $('#main_add_image').click(function(){ 
    });
    $('#main_add_file').click(function(){ 
    });
    $('#main_add_folder').click(function(){ 
    });
    $('#main_add_excel_import_contacts').click(function(){ 
    });
    $('#main_add_excel_import_ccredentials').click(function(){ 
    });
    $('#main_add_excel_import_others').click(function(){ 
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
                alert("Reloaded Successfully!");
            },
            error: function() {
                alert("Error while Reloading!");
            }
        });
    });
    
 
    

});

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
                  console.log("You clicked Save action the value changed");
              }
          },
          {
              caption: "Cencel",
              cls: "js-dialog-close",
              onclick: function(){
                  console.log("You clicked Cencel action");
              }
          }
      ]
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
          //     caption: "Cencel",
          //     cls: "js-dialog-close",
          //     onclick: function(){
          //         console.log("You clicked Cencel action");
          //     }
          // }
      ]
  });
}



function exportSelectedDialog(){
  Metro.dialog.create({
      title: "Export Selected Dialog",
      content: '<div class="fixed-size"><div id="tree2" data-source="ajax" class="sampletree"></div></div>',
      actions: [
        {
          caption: "Cencel",
          cls: "js-dialog-close",
          onclick: function(){
            
              console.log("You clicked Cencel action Export Selected Dialog");
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
      //,
      // onCreate: function(dialog){tree.getSelectedNodes().toDict(true)
      //   setTimeout(function(){
      //     initializetree2();
      //   }, 500);
       
      // }
  });
}

function initializetree2()
{
        
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

            lazyLoad: function(event, data) {
              data.result = {url: "ajax-sub2.json"}
            },

            createNode: function(event, data) {
              var node = data.node,
                $tdList = $(node.tr).find(">td");

              if (node.isFolder()) {
                $tdList
                  .eq(2)
                  .prop("colspan", 6)
                  .nextAll()
                  .remove();
              }
            },
            renderColumns: function(event, data) {
              var node = data.node,
                $tdList = $(node.tr).find(">td");

              // (Index #0 is rendered by fancytree by adding the checkbox)
              // Set column #1 info from node data:
              $tdList.eq(1).text(node.getIndexHier());
              // (Index #2 is rendered by fancytree)
              // Set column #3 info from node data:
              $tdList
                .eq(3)
                .find("input")
                .val(node.key);
              $tdList
                .eq(4)
                .find("input")
                .val(node.data.foo);

            },
            modifyChild: function(event, data) {
              data.tree.info(event.type, data);
            },

            //events
            // --- Tree events -------------------------------------------------
            blurTree: function(event, data) {
              logEvent(event, data);
            },
            create: function(event, data) {
              logEvent(event, data);
            },
            init: function(event, data, flag) {
              logEvent(event, data, "flag=" + flag);
            },
            focusTree: function(event, data) {
              logEvent(event, data);
            },
            restore: function(event, data) {
              logEvent(event, data);
            },
            // --- Node events -------------------------------------------------
            activate: function(event, data) {
              logEvent(event, data);
              var node = data.node;
              // acces node attributes
              $("#echoActive").text(node.title);
              if( !$.isEmptyObject(node.data) ){
      //					alert("custom node data: " + JSON.stringify(node.data));
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
            lazyLoad: function(event, data) {
              logEvent(event, data);
              // return children or any other node source
              data.result = {url: "ajax-sub2.json"};
      //				data.result = [
      //					{title: "A Lazy node", lazy: true},
      //					{title: "Another node", selected: true}
      //					];
            },
            loadChildren: function(event, data) {
              logEvent(event, data);
            },
            loadError: function(event, data) {
              logEvent(event, data);
            },
            modifyChild: function(event, data) {
              logEvent(event, data, "operation=" + data.operation +
                ", child=" + data.childNode);
            },
            postProcess: function(event, data) {
              logEvent(event, data);
              // either modify the Ajax response directly
              data.response[0].title += " - hello from postProcess";
              // or setup and return a new response object
      //				data.result = [{title: "set by postProcess"}];
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
}


function openColorTopMenuDialog(){
  Metro.dialog.create({
      title: "Color Dialog Top Menu",
      content: '<div class="fixed-size-2"><div id="color-selector-top-menu"></div></div>',
      actions: [
          {
              caption: "Apply",
              cls: "js-dialog-close alert",
              onclick: function(){
                var colorSelector = $("#color-selector-top-menu").data("colorSelector");
                if (colorSelector) {
                  var color = colorSelector.color();
                  console.log("Color value: " + color);
                } else {
                  console.log("Color selector not initialized.");
                }
                  console.log("You clicked Save action the value Color Dialog");
              }
          },
          {
              caption: "Cencel",
              cls: "js-dialog-close",
              onclick: function(){
                  console.log("You clicked Cencel Color Dialog");
              }
          }
      ]
  });
}
