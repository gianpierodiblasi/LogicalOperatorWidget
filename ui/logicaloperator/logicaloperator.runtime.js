/* global TW */
TW.Runtime.Widgets.logicaloperator = function () {
  var thisWidget = this;

  this.runtimeProperties = function () {
    return {
      'needsDataLoadingAndError': false
    };
  };

  this.renderHtml = function () {
    var html = '';
    html = '<div class="widget-content widget-logicaloperator" style="display:none;"></div>';
    return html;
  };

  this.afterRender = function () {
  };

  this.serviceInvoked = function (serviceName) {
    if (serviceName === 'Evaluate') {
      var operation = thisWidget.getProperty('operation');
      var debugMode = thisWidget.getProperty('debugMode');
      var numberOfOperands = thisWidget.getProperty('numberOfOperands');

      if (debugMode) {
        console.log("LogicalOperator -> Start");
        console.log("LogicalOperator -> operation = " + operation);
        console.log("LogicalOperator -> numberOfOperands = " + numberOfOperands);
      }

      var output;
      switch (operation) {
        case "OR":
          output = false;
          for (var operandN = 1; operandN <= numberOfOperands; operandN++) {
            var value = !!this.getProperty('operand' + operandN);
            if (debugMode) {
              console.log("LogicalOperator -> operand" + operandN + " = " + value);
            }
            output |= value;
          }
          break;
        case "AND":
          output = true;
          for (var operandN = 1; operandN <= numberOfOperands; operandN++) {
            var value = !!this.getProperty('operand' + operandN);
            if (debugMode) {
              console.log("LogicalOperator -> operand" + operandN + " = " + value);
            }
            output &= value;
          }
          break;
        case "NOT":
          var value = !!this.getProperty('operand');
          if (debugMode) {
            console.log("LogicalOperator -> operand = " + value);
          }
          output = !value;
          break;
      }

      output = !!output;
      if (debugMode) {
        console.log("LogicalOperator -> output = " + output);
        console.log("LogicalOperator -> Stop");
      }

      thisWidget.setProperty("output", output);
      thisWidget.jqElement.triggerHandler("Evaluated");
    }
  };

  this.updateProperty = function (updatePropertyInfo) {
    if (updatePropertyInfo.TargetProperty.startsWith("operand")) {
      this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
    }
  };
};