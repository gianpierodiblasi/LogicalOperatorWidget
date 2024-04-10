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
      var customJSON = thisWidget.getProperty('customJSON');
      var customExpressions = thisWidget.getProperty('customExpressions');

      if (debugMode) {
        console.log("LogicalOperator -> Start");
        console.log("LogicalOperator -> operation = " + operation);
        console.log("LogicalOperator -> numberOfOperands = " + numberOfOperands);
        console.log("LogicalOperator -> customJSON = " + customJSON);
        console.log("LogicalOperator -> customExpressions = " + customExpressions);
      }

      var output;
      switch (operation) {
        case "OR":
        case "NOR":
          output = false;
          for (var operandN = 1; operandN <= numberOfOperands; operandN++) {
            var value = !!this.getProperty('operand' + operandN);
            if (debugMode) {
              console.log("LogicalOperator -> operand" + operandN + " = " + value);
            }
            output |= value;
          }
          if (operation === "NOR") {
            output = !output;
          }
          break;
        case "AND":
        case "NAND":
          output = true;
          for (var operandN = 1; operandN <= numberOfOperands; operandN++) {
            var value = !!this.getProperty('operand' + operandN);
            if (debugMode) {
              console.log("LogicalOperator -> operand" + operandN + " = " + value);
            }
            output &= value;
          }
          if (operation === "NAND") {
            output = !output;
          }
          break;
        case "XOR":
        case "NXOR":
          var count = 0;
          for (var operandN = 1; operandN <= numberOfOperands; operandN++) {
            var value = !!this.getProperty('operand' + operandN);
            if (debugMode) {
              console.log("LogicalOperator -> operand" + operandN + " = " + value);
            }
            if (value) {
              count++;
            }
          }
          output = count === 1;
          if (operation === "NXOR") {
            output = !output;
          }
          break;
        case "NOT":
          var value = !!this.getProperty('operand');
          if (debugMode) {
            console.log("LogicalOperator -> operand = " + value);
          }
          output = !value;
          break;
        case "CUSTOM":
          customJSON = JSON.parse(customJSON);
          customExpressions = JSON.parse(customExpressions);
          var outputs = {};
          var toEval = Object.keys(customJSON).filter(name => customJSON[name].type === "IN").reduce((acc, property) => acc + "var " + property + " = " + thisWidget.getProperty(property) + ";\n", "");
          toEval += Object.keys(customJSON).filter(name => customJSON[name].type === "OUT").reduce((acc, property) => acc + "outputs['" + property + "'] = " + customExpressions[property] + ";\n", "");
          eval(toEval);

          Object.keys(outputs).forEach(output => {
            if (debugMode) {
              console.log("LogicalOperator -> " + output + " = " + outputs[output]);
              console.log("LogicalOperator -> Stop");
            }
            thisWidget.setProperty(output, outputs[output]);
          });
          break;
      }

      if (operation !== "CUSTOM") {
        output = !!output;
        if (debugMode) {
          console.log("LogicalOperator -> output = " + output);
          console.log("LogicalOperator -> Stop");
        }

        thisWidget.setProperty("output", output);
      }

      thisWidget.jqElement.triggerHandler("Evaluated");
    }
  };

  this.updateProperty = function (updatePropertyInfo) {
    var invoke = false;
    if (updatePropertyInfo.TargetProperty.startsWith("operand")) {
      this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
      invoke = true;
    } else if (thisWidget.getProperty('operation') === "CUSTOM") {
      var customJSON = JSON.parse(thisWidget.getProperty("customJSON"));
      for (var key in customJSON) {
        if (customJSON[key].type === "IN" && updatePropertyInfo.TargetProperty === key) {
          this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
          invoke = true;
        }
      }
    }

    if (invoke && thisWidget.getProperty("autoEvaluate")) {
      this.serviceInvoked("Evaluate");
    }
  };
};