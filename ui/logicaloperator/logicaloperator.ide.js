/* global TW */
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
            {value: 'NOT', text: 'NOT'}
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
        }
      }
    };
  };

  this.renderHtml = function () {
    return '<div class="widget-content widget-logicaloperator">' + '<span class="logicaloperator-property">Logical Operator</span>' + '</div>';
  };

  this.afterRender = function () {
    this.addNewParameters(this.getProperty('operation'), this.getProperty('numberOfOperands'));
  };

  this.afterSetProperty = function (name, value) {
    if (name === 'operation' || name === 'numberOfOperands') {
      this.deleteOldParameters();

      switch (name) {
        case "operation":
          this.addNewParameters(value, this.getProperty('numberOfOperands'));
          break;
        case "numberOfOperands":
          this.addNewParameters(this.getProperty('operation'), value);
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
  };

  this.addNewParameters = function (operation, numberOfOperands) {
    var properties = this.allWidgetProperties().properties;
    properties["numberOfOperands"].isVisible = operation !== "NOT";

    if (properties["numberOfOperands"].isVisible) {
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
    } else {
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