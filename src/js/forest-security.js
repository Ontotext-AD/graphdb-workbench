var changesWereMade = false;
var saveButtonClicked = false;

window.onbeforeunload = function (e) {
	if(changesWereMade && !saveButtonClicked){
		  var message = "Are you sure you want to navigate away from this page?",
		  e = e || window.event;
		  // For IE and Firefox
		  if (e) {
		    e.returnValue = message;
		  }
	
		  // For Safari
		  return message;
	}
};


$(function() {	
	if($('.loginForm').length!=1){
		changesWereMade = false;
		saveButtonClicked = false;
		
		$('input').change(function(){
			changesWereMade=true;
		});
		
		$('.saveButton').click(function(){
			saveButtonClicked=true;
			$(this).closest("form").submit();
		});
	}
	
	if($('.icon-exclamation-sign').length==1){
		$('.loginSubmit').attr('disabled', 'disabled');
		
		$('.form-horizontal input').keyup(function(){
			$('.loginSubmit').removeAttr('disabled');
		});
	}
	
	$('.enableSecurity, .disableSecurity').click(function(){
		$(this).next().submit();
	});
	
	$('.editUser').click(function(){
		$(this).next().submit();
	});
	
	$('.deleteUserIcon').click(function() {
		$('#confirmDeleteContainer').modal('show');
		var delIcon = $(this);
		$('.deleteUserButton').click(function(e) {
        	delIcon.nextAll('form').first().submit();
        	delIcon.unbind('click');
        });
	});

	$('#role_admin').click(function() {
		if ($(this).is(':checked')) {
			$('input[id^="READ_REPO_"]').attr('checked', true);
        	$('input[id^="WRITE_REPO_"]').attr('checked', true);
        	$('input[id^="READ_REPO_"]').attr('disabled', true);
        	$('input[id^="WRITE_REPO_"]').attr('disabled', true);
		} else {
			$('input[id^="READ_REPO_"]').each(function() {
				var oldChecked =  $(this).attr('data-checked');
				 $(this).attr('checked', oldChecked || null);
			});
			$('input[id^="WRITE_REPO_"]').each(function() {
				var oldChecked =  $(this).attr('data-checked');
				$(this).attr('checked', oldChecked || null);
			});
        	$('input[id^="READ_REPO_"]:not(#READ_REPO_SYSTEM)').attr('disabled', false);
        	$('input[id^="WRITE_REPO_"]').attr('disabled', false);
		}
	});

	$('input[id^="WRITE_REPO_"]:not(#WRITE_REPO_SYSTEM)').click(function () {
		var readRepoINPUT = $(this).attr('id').replace('WRITE_REPO_', 'READ_REPO_');
		var input = $('input[id="' + readRepoINPUT + '"]');
		if ($(this).is(':checked')) {
			input.attr('checked', true);
			input.attr('disabled', true);
		} else {
			var oldChecked = input.attr('data-checked');
			input.attr('checked', oldChecked || null);
			input.attr('disabled', false);
		}
	});

	addUserFormValidationsAndEvents();
});

function addUserFormValidationsAndEvents() {
	$('.newUserForm').submit(function(e) {
		var check = true;

		if ($('.username').val() == undefined || $('.username').val().length<1 ) {
			$('.usernameError').html('Enter username!').show();
			check = false;
		}
		if ($('.password1').val() == undefined || $('.password1').val().length<1 ) {
			$('.password1Error').html('Enter password!').show();
			check = false;
		}
		if ($('.password2').val() == undefined || $('.password2').val().length<1 ) {
			$('.password2Error').html('Confirm password!').show();
			check = false;
		}
		return check;
	});
	$('.userForm').submit(function(e) {
		var check = true;
		if ($('.password1').val() !=  $('.password2').val()) {
			$('.password2Error').html('Passwords do not match!').show();
			check = false;
		}

		if ($('input[id^="READ_REPO_"]:not(#READ_REPO_SYSTEM):checked').size() == 0 && $('input[name="username"]').val() != 'admin') {
			$('.authoritiesError').html('User should have read rights to at least one repo!').show();
        	check = false;
        }
        if (check) {
        	$("input").removeAttr("disabled");
        }
		
		return check;
	});
	
	$('.userForm .username').keyup(function(){
		$('.usernameError').hide();
	});
	$('.userForm .password1').keyup(function(){
		$('.password1Error').hide();
	});
	$('.userForm .password2').keyup(function(){
		$('.password2Error').hide();
	});
	$('input[id^="READ_REPO_"]').change(function() {
		$('.authoritiesError').hide();
	});

}