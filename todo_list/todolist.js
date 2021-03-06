$(function() {

  // SETUP
  let $list;
  let itemStr = '';                                 // item is an empty string
  $list = $('ul');                               // Cache the unordered list

  // ITEM COUNTER
  function updateCount() {                       // Create function to update counter
    $('#todo').text($('.item.todo').length); // count todo items
    $('#done').text($('.item.done').length); // count doned items
    $('#allItems').text($('.item').length); // count all items
  }
  
  // UPDATE LOCAL STORAGE
  function updateLocalStorage(){
    localStorage.clear();
    let itemArray = [];
    $('.itemName').each(function(){
      let itemObj = {
        name : $(this).val(),
        status : $(this).attr('class'),
        check : $(this).siblings('#check').attr('class'),
        parentStat : $(this).parent().attr('class')
      };
      itemArray.push(itemObj);
    });
    localStorage.setItem('allItems', JSON.stringify(itemArray)); // store the done list
  }
  
  // LOAD LOCAL STORAGE
  function loadLocalStorage(){
    let itemArray = JSON.parse(localStorage.getItem('allItems'));
    if (itemArray !== null){
      for (let itemObj of itemArray){
        $list.append('<li class=\'' + itemObj.parentStat + '\'><textarea name=\'text\' class=\'' + itemObj.status + '\' disabled=\'true\'>' + itemObj.name + '</textarea></li>'); // add item
        let newItem = $list.children().last();
        newItem.append('<i id=\'trashcan\' class="far fa-trash-alt hide"></i>'); // add trashcan icon
        newItem.prepend('<i id=\'check\' class=\'' + itemObj.check + '\'></i>'); // add circle or check icon for choosing
      }
    }
  }
  
  
  loadLocalStorage();
  updateCount();  

  // Add new item to the list via input 
  $('#itemDescription').change(function(){
    itemStr = $(this).val();
    $list.append('<li class=\'item todo\'><textarea name=\'text\' class=\'itemName todo\' disabled=\'true\'>' + itemStr + '</textarea></li>'); // add item
    let newItem = $list.children().last();
    newItem.append('<i id=\'trashcan\' class="far fa-trash-alt hide"></i>'); // add trashcan icon
    newItem.prepend('<i id=\'check\' class="far fa-circle"></i>'); // add circle icon for choosing
    $(this).val('');
    updateCount();
    updateLocalStorage();
  });
  
  // Hover over item to show trashcan icon (a better practice should be wrapping these two in another div annd do the event listening on the div, instead of on these two elements individually)
  $list.on('mouseenter mouseleave', '.itemName', function(e){ // hover over item
    $(e.target).next().toggleClass('show hide');
  });
  $list.on('mouseenter mouseleave', '#trashcan', function(e){ // hover over trashcan itself
    $(e.target).toggleClass('show hide');
  });
  
  // Click trashcan icon to delete an item
  $list.on('click', '#trashcan', function(e){
    $(e.target).parent().remove();
    updateCount();
    updateLocalStorage();
  });

  // Click check icon to toggle completion of an item
  $list.on('click', '#check', function(e){
    let $target = $(e.target);
    $target.next().toggleClass('todo done');
    $target.toggleClass('fa-circle fa-check-circle');
    $target.parent().toggleClass('todo done');
    updateCount();
    updateLocalStorage();
  });
  
  // Double click an item to modify its content. This is only possible if the item is todo. Once item becomes done,
  // it cannot be modified unless it reverts back to todo
  $list.on('dblclick', '.itemName.todo', function(e){
    let $target = $(e.target);
    itemStr = $target.val();
    let $nextTarget = $target.next();
    $target.remove(); // remove original textarea
    $('<input type=\'text\' class=\'itemName todo edit\' value=\'' + itemStr + '\'>').insertBefore($nextTarget); // use input tag for editing to take advantage of return key
    $('.itemName.todo.edit').focus();
  });
  
  // Revert input box back to default when it loses focus, used when an item is double-clicked, but no change is made
  $list.on('blur', '.itemName.todo.edit', function(e){
    let $target = $(e.target);
    let $nextTarget = $target.next();
    $target.remove(); // remove input tag
    $('<textarea name=\'text\' class=\'itemName todo\' disabled=\'true\'>' + itemStr + '</textarea>').insertBefore($nextTarget); // put the textarea back
    if($nextTarget.hasClass('show')) // hide the trashcan when the input area is out of focus
      $nextTarget.toggleClass('hide show');
  });
  
  // Revert input box back to default, used to modify item value
  $list.on('change', '.itemName.todo.edit', function(e){
    let $target = $(e.target);
    if ($target.val() !== '') // user deletes item description, revert item back to original. Item can only be removed from trashcan icon
      itemStr = $target.val();
    
    let $nextTarget = $target.next();
    $target.remove(); // remove input tag
    $('<textarea name=\'text\' class=\'itemName todo\' disabled=\'true\'>' + itemStr + '</textarea>').insertBefore($nextTarget); // put the textarea back
    if($nextTarget.hasClass('show')) // hide the trashcan when the input area is out of focus
      $nextTarget.toggleClass('hide show');
    
    updateLocalStorage();
  });
  
  
  
  // HANDLE DROPDOWN MENU ACTIONS
  // handle mark all done action
  $('.dropdown-menu').on('click', '#markAllDone', function(){
    $('.item').each(function(){
      let $check = $(this).children('#check');
      let $itemName = $(this).children('.itemName');
      if($check.hasClass('fa-circle'))
        $check.toggleClass('fa-circle fa-check-circle');
      if($itemName.hasClass('todo'))
        $itemName.toggleClass('todo done');
      if($(this).hasClass('todo'))
        $(this).toggleClass('todo done');
    });
    updateCount();
    updateLocalStorage();
  });
  
  // handle mark all todo action
  $('.dropdown-menu').on('click', '#markAllTodo', function(){
    $('.item').each(function(){
      let $check = $(this).children('#check');
      let $itemName = $(this).children('.itemName');
      if($check.hasClass('fa-check-circle'))
        $check.toggleClass('fa-circle fa-check-circle');
      if($itemName.hasClass('done'))
        $itemName.toggleClass('todo done');
      if($(this).hasClass('done'))
        $(this).toggleClass('todo done');
    });
    updateCount();
    updateLocalStorage();
  });
  
  
  // sort 'li' by item's name
  let sortByValue = function(a, b){ // sort based on whether the item's name
    a = $(a).children('textarea').val();
    b = $(b).children('textarea').val();
    return a > b ? 1 : a < b ? -1 : 0; // compare. alphabetically ascending
  };
  
  // handle sort action. It sorts based on item's name, and groups items based on whether they are done or todo.
  $('.dropdown-menu').on('click', '#sort', function(){
    $('.item.todo').sort(sortByValue).appendTo($list); // note that appendTo() and append() essentially moves children to the end if they already exist under the parent.
    $('.item.done').sort(sortByValue).appendTo($list);
    updateCount();
    updateLocalStorage();
  });
  
  // handle remove doned action.
  $('.dropdown-menu').on('click', '#removeDone', function(){
    $('.item.done').remove();
    updateCount();
    updateLocalStorage();
  });
  
  // handle remove todo action.
  $('.dropdown-menu').on('click', '#removeTodo', function(){
    $('.item.todo').remove();
    updateCount();
    updateLocalStorage();
  });
  
  // handle remove all action.
  $('.dropdown-menu').on('click', '#removeAll', function(){
    $('.item').remove();
    updateCount();
    updateLocalStorage();
  });
  

});