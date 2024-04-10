/* global TW, TWX, dagre */
$("head").append('<link href="../Common/extensions/LogicalOperatorWidget/ui/logicaloperator/jslibrary/logicalcircuit-ui.css" rel="stylesheet">');
$("body").append('<script type="text/javascript" src="../Common/extensions/LogicalOperatorWidget/ui/logicaloperator/jslibrary/logicalcircuit_with_qmc-bundle-min-1.0.0.js"></script>');
$("body").append('<script type="text/javascript" src="../Common/extensions/LogicalOperatorWidget/ui/logicaloperator/jslibrary/dagre.min.js"></script>');

TW.IDE.Dialogs.LogicalOperatorCustomEditor = function () {
  var uid = new Date().getTime() + "_" + Math.floor(1000 * Math.random());
  this.title = 'Custom Logical Operator';
  var json, jsonUI, operation, logicalCircuitUI;

  this.renderDialogHtml = function (widgetObj) {
    json = widgetObj.properties['customJSON'];
    jsonUI = widgetObj.properties['customJSONUI'];
    operation = widgetObj.properties['operation'];

    var html = "<div id='LogicalOperatorCustomEditor_" + uid + "'>" + (operation !== "CUSTOM" ? "Select CUSTOM operation to use the Custom Logical Operator" : "") + "</div>";
    return html;
  };

  this.afterRender = function (domElementId) {
    if (operation === "CUSTOM") {
      logicalCircuitUI = new LogicalCircuitUI(document.querySelector("#LogicalOperatorCustomEditor_" + uid), {
        width: 800,
        height: 500,
        "showOperatorType": true,
        "bezierConnector": true,
        "interactive": true,
        "lang": "en"
      });

      logicalCircuitUI.setSimplifier(minterms => new QuineMcCluskey(minterms).toString());

      logicalCircuitUI.setReorganizer((symbolSize, edges, width, height) => {
        var g = new dagre.graphlib.Graph();
        g.setGraph({
          "rankdir": "LR",
          "marginx": 20,
          "marginy": 20
        });
        g.setDefaultEdgeLabel(() => {
          return {};
        });

        Object.keys(symbolSize).forEach(property => g.setNode(property, {width: symbolSize[property].width, height: symbolSize[property].height}));
        edges.forEach(edge => g.setEdge(edge.from, edge.to));

        dagre.layout(g);
        var graph = g.graph();

        var scale = graph.width > width || graph.height > height ? Math.min(width / graph.width, height, graph.height) : 1;

        var json = {};
        g.nodes().forEach(v => {
          var node = g.node(v);
          json[v] = {
            "left": node.x * scale - node.width / 2,
            "top": node.y * scale - node.height / 2
          };
        });
        return json;
      });

      logicalCircuitUI.addBlackListWord("Width");
      logicalCircuitUI.addBlackListWord("Height");
      logicalCircuitUI.addBlackListWord("operation");
      logicalCircuitUI.addBlackListWord("numberOfOperands");
      logicalCircuitUI.addBlackListWord("output");
      logicalCircuitUI.addBlackListWord("debugMode");
      logicalCircuitUI.addBlackListWord("autoEvaluate");
      logicalCircuitUI.addBlackListWord("customJSON");
      logicalCircuitUI.addBlackListWord("customJSONUI");
      logicalCircuitUI.addBlackListWord("customExpressions");

      logicalCircuitUI.setJSONs(JSON.parse(json), JSON.parse(jsonUI));
    }
  };

  this.updateProperties = function (widgetObj) {
    if (operation === "CUSTOM" && logicalCircuitUI.isValid()) {
      widgetObj.setProperty('customJSON', JSON.stringify(logicalCircuitUI.getJSON()));
      widgetObj.setProperty('customJSONUI', JSON.stringify(logicalCircuitUI.getJSONUI()));
      widgetObj.setProperty('customExpressions', JSON.stringify(logicalCircuitUI.getJavaScriptExpressions()));
    }
    return true;
  };
};

TW.IDE.Widgets.logicaloperator = function () {
  this.widgetIconUrl = function () {
    return '../Common/extensions/LogicalOperatorWidget/ui/logicaloperator/or.png';
  };

  this.widgetProperties = function () {
    return {
      'name': 'LogicalOperator',
      'description': 'Widget to perform logical operations',
      'category': ['Common'],
      'iconImage': 'or.png',
      'customEditor': 'LogicalOperatorCustomEditor',
      'customEditorMenuText': 'Edit Custom Logical Operator',
      'properties': {
        'Width': {
          'description': 'width',
          'defaultValue': 200
        },
        'Height': {
          'description': 'height',
          'defaultValue': 28
        },
        'operation': {
          'description': 'The logical operation',
          'baseType': 'STRING',
          'defaultValue': 'OR',
          'selectOptions': [
            {value: 'OR', text: 'OR'},
            {value: 'NOR', text: 'NOR'},
            {value: 'AND', text: 'AND'},
            {value: 'NAND', text: 'NAND'},
            {value: 'XOR', text: 'XOR'},
            {value: 'NXOR', text: 'NXOR'},
            {value: 'NOT', text: 'NOT'},
            {value: 'CUSTOM', text: 'CUSTOM'}
          ]
        },
        'numberOfOperands': {
          'description': 'The operands number',
          'baseType': 'INTEGER',
          'defaultValue': 2
        },
        'output': {
          'description': 'The output',
          'baseType': 'BOOLEAN',
          isEditable: false,
          isBindingSource: true
        },
        'debugMode': {
          'isVisible': true,
          'baseType': 'BOOLEAN',
          'isEditable': true,
          'defaultValue': false,
          'description': 'true to activate the debug'
        },
        'autoEvaluate': {
          'isVisible': true,
          'baseType': 'BOOLEAN',
          'isEditable': true,
          'defaultValue': false,
          'description': 'true to automatically evaluate output when a new operand value is set'
        },
        "customJSON": {
          'baseType': 'STRING',
          'defaultValue': '{}',
          'isVisible': false
        },
        "customJSONUI": {
          'baseType': 'STRING',
          'defaultValue': '{}',
          'isVisible': false
        },
        "customExpressions": {
          'baseType': 'STRING',
          'defaultValue': '{}',
          'isVisible': false
        }
      }
    };
  };

  this.renderHtml = function () {
    return '<div class="widget-content widget-logicaloperator">' + '<span class="logicaloperator-property">Logical Operator</span>' + '</div>';
  };

  this.afterRender = function () {
    this.addNewParameters(this.getProperty('operation'), this.getProperty('numberOfOperands'), this.getProperty('customJSON'));
  };

  this.afterSetProperty = function (name, value) {
    if (name === 'operation' || name === 'numberOfOperands' || name === 'customJSON') {
      this.deleteOldParameters();

      switch (name) {
        case "operation":
          this.addNewParameters(value, this.getProperty('numberOfOperands'), this.getProperty("customJSON"));
          break;
        case "numberOfOperands":
          this.addNewParameters(this.getProperty('operation'), value, this.getProperty("customJSON"));
          break;
        case "customJSON":
          this.addNewParameters(this.getProperty('operation'), this.getProperty('numberOfOperands'), value);
          break;
      }
    }

    return false;
  };

  this.deleteOldParameters = function () {
    var properties = this.allWidgetProperties().properties;

    for (var key in properties) {
      if (key.toLowerCase().startsWith("operand")) {
        delete properties[key];
      }
    }

    var customJSON = JSON.parse(this.getProperty("customJSON"));
    for (var key in customJSON) {
      delete properties[key];
    }
  };

  this.addNewParameters = function (operation, numberOfOperands, customJSON) {
    var properties = this.allWidgetProperties().properties;
    properties["numberOfOperands"].isVisible = !["NOT", "CUSTOM"].includes(operation);
    properties["output"].isVisible = operation !== "CUSTOM";

    switch (operation) {
      case "NOT":
        properties['operand'] = {
          isBaseProperty: false,
          name: 'operand',
          type: 'property',
          description: 'operand',
          isBindingTarget: true,
          baseType: "BOOLEAN",
          isEditable: true,
          isVisible: true
        };
        break;
      case "CUSTOM":
        customJSON = JSON.parse(customJSON);
        for (var key in customJSON) {
          if (["IN", "OUT"].includes(customJSON[key].type)) {
            properties[key] = {
              isBaseProperty: false,
              name: key,
              type: 'property',
              description: key,
              isBindingTarget: customJSON[key].type === "IN",
              isBindingSource: customJSON[key].type === "OUT",
              baseType: "BOOLEAN",
              isEditable: customJSON[key].type === "IN",
              isVisible: true
            };
          }
        }
        break;
      default:
        for (var operandN = 1; operandN <= numberOfOperands; operandN++) {
          properties['operand' + operandN] = {
            isBaseProperty: false,
            name: 'operand' + operandN,
            type: 'property',
            description: 'operand N. ' + operandN,
            isBindingTarget: true,
            baseType: "BOOLEAN",
            isEditable: true,
            isVisible: true
          };
        }
        break;
    }

    this.updatedProperties({
      updateUI: true
    });
  };

  this.widgetServices = function () {
    return {
      'Evaluate': {
        'warnIfNotBound': true
      }
    };
  };

  this.widgetEvents = function () {
    return {
      'Evaluated': {}
    };
  };
};