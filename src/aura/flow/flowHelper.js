({
    runFlow : function(component, flow, isAutoLaunched, flowOutputParamNames) {
        component.set("v.body", []);
        if(isAutoLaunched) {
            var helper = this;
            var action = component.get("c.runFlow");
            action.setParams({ 
                flow : flow,
                flowOutputParamNames : flowOutputParamNames,  
                record : component.get('v.simpleRecord') });  
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var outputVariables = response.getReturnValue();
                    helper.handleFlowOutput(component, outputVariables);
                }});
            $A.enqueueAction(action);                
        } else {
            $A.createComponent("lightning:flow", { 'onstatuschange' : component.getReference('c.onFlowStatusChange') }, 
                function(newFlow, status, errorMessage) {
                    component.set("v.body", [ newFlow ]);
                    newFlow.startFlow(flow, [ 
                       { name: 'flowtb_record', type : 'SObject', value : component.get('v.simpleRecord') } ] );
                });                     
        }    
    },
	handleFlowOutput : function(component, outputVariables) {
	    var flowToRun = null;
        var eventToFire = null;
        var eventParams = {};
        var outputVar;	
        for(var i = 0; i < outputVariables.length; i++) {
            outputVar = outputVariables[i];
            if(outputVar.name === 'flowtb_runFlow') {
                flowToRun = outputVar.value;
            } else if(outputVar.name === 'flowtb_event') {
                eventToFire = $A.get(outputVar.value);
            } else if (outputVar.name.startsWith('flowtb_param')) {
                var paramName = outputVar.name.split('_')[2];
                eventParams[paramName] = outputVar.value; 
            }                
        }
        if(eventToFire!=null) {
            eventToFire.setParams(eventParams);
            eventToFire.fire();
        }
        if(flowToRun!=null) {
            this.runFlow(component, flowToRun);
        }		
	}
})