
$(document).ready(function () {
    bindDynamicTabs();
    
    initDynamicLinks();
});

function initDynamicContent(container) {
    //initDynamicForm(container);

    bindDynamicTabs(container);

    initDynamicLinks(container);
}
