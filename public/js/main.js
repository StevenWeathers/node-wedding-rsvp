$(document).on("submit", "#rsvp_form", function(event) {
  var $numberGuests, $name, $attending, $this, numGuestsValid, nameValid, attendingValid;

  event.preventDefault();

  $this = $(this);
  $name = $this.find("#name");
  $numberGuests = $this.find("#numberGuests");
  $attending = $this.find('input[name=attending]');

  nameValid = true;
  numGuestsValid = true;
  attendingValid = true;

  $this.find(".error-label").remove();
  $name.parent(".form-group").removeClass("has-error");
  $numberGuests.parent(".form-group").removeClass("has-error");

  $(".contact-error-msg, .contact-success-msg").remove();
  
  if (!$name.val().length) {
    nameValid = false;
    $name.parent(".form-group").addClass("has-error");
    $name.after("<label class=\"error-label\">Name cannot be blank.</label>");
    return;
  }

  if (!$numberGuests.val().length) {
    numGuestsValid = false;
    $numberGuests.parent(".form-group").addClass("has-error");
    $numberGuests.after("<label class=\"error-label\">Number of Guests cannot be blank.</label>");
    return;
  }

  if (!$attending.is(":checked")) {
    attendingValid = false;
    $attending.closest(".form-group").addClass("has-error");
    $attending.closest(".form-group").prepend("<label class=\"control-label\">Please let us know whether or not you will be attending.</label>");
    return;
  }

  if (nameValid && numGuestsValid && attendingValid) {
    $.ajax({
      type: "POST",
      url: "/rsvp",
      data: $this.serialize()
    }).fail(function(error) {
      $this.before("<div class=\"alert alert-danger alert-dismissible contact-error-msg\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\"><span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span></button> Please Try Again.</div>");
    }).done(function(data) {
      $this.before("<div class=\"alert alert-success alert-dismissible contact-success-msg\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\"><span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span></button>You're RSVP has been successfully submitted.</div>");
      $name.val('');
      $numberGuests.val('1');
    });
  }
});