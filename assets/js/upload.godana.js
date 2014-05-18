(function($) {    
    var jcrop_api, boundx, boundy, $preview, $pcnt,
        $pimg, xsize, ysize, $label;
    var d = {
        x: 0,
        y: 0,
        w: 100,
        h: 100
    };
    var cropCoordinates = {};
    

    var methods = {
	init: function(options) { 
	    // Repeat over each element in selector
	    return this.each(function() {
            var $this = $(this);

            // Attempt to grab saved settings, if they don't exist we'll get "undefined".
            var settings = $this.data('imageupload');

            // If we could't grab settings, create them from defaults and passed options
            if(typeof(settings) == 'undefined') { 
                settings = $.extend({}, defaults, options);

                // Save our newly created settings
                $this.data('imageupload', settings);
            } else {
                // We got settings, merge our passed options in with them (optional)
                settings = $.extend({}, settings, options);

                // If you wish to save options passed each time, add:
                // $this.data('pluginName', settings);
            }

            $this.on("click", function() {
                $('#'+settings.modalId).modal('show');
                disableSubmit();
            });	

            $label = $('.'+settings.fileInputWrapper+' label');
            $label.on("click", function () {
                $(document).on("click", '#'+settings.fileInputId, function(){});
            });

            $(document).on('click', '.'+settings.uploadCancel, function() {
               showFileInputWrapper();
            });

            /*$(document).on('click', '.delete-image', function() {
                showFileInputWrapper();		    
            });*/
            $('#'+settings.formId).bind('fileuploaddestroyed', function (e, data) {
                showFileInputWrapper();		    
            });

            $('#'+settings.formId).fileupload({
                maxFileSize: 2000000,
                acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
                url: settings.uploadUrl
            }).on('fileuploadadd', function() {
                $('.'+settings.fileInputWrapper).hide();
            }).on('fileuploadalways', function(e, data) {
                var files = data.result.files;
                if (files.length) {
                    for (var i=0, file; file=files[i]; i++) {
                        if (settings.doCrop) {
                            $('.preview').addClass('preview-cropped');
                            $preview = $('#preview-pane');
                            $preview.removeClass('hide');
                            $('.'+settings.cropButton).removeClass('hide');
                            $pcnt = $('#preview-pane .preview-container');
                            $pimg = $('#preview-pane .preview-container img');
                            xsize = $pcnt.width();
                            ysize = $pcnt.height();
                            cropCoordinates.source = {};
                            cropCoordinates.source.file = file.url;    
                            $('#target').Jcrop({
                              onChange: updatePreview,
                              onSelect: updatePreview,
                              onRelease: disableSubmit,
                              aspectRatio: xsize / ysize
                            },function(){
                                  // Use the API to get the real image size
                                var bounds = this.getBounds();
                                boundx = bounds[0];
                                boundy = bounds[1];
                                  // Store the API in the jcrop_api variable
                                jcrop_api = this;
                                cropCoordinates.source.width = boundx;
                                cropCoordinates.source.height = boundy;
                                  // Move the preview into the jcrop container for css positioning
                                $preview.appendTo(jcrop_api.ui.holder);

                            });
                            /*$(document).on('click', '.'+settings.cropButton, function(e) {
                                if (jcrop_api != undefined) {	
                                    $.post(
                                        settings.cropUrl,
                                        cropCoordinates,
                                        function() {
                                            //$('#uploadModal').modal('hide');
                                        }
                                    );
                                }
                                return false;
                            });*/
                        } else {
                            enableSubmit();
                        }
                    }
                }			
                });	
            });
	    },
	    destroy: function(options) {
		// Repeat over each element in selector
            return $(this).each(function() {
                var $this = $(this);
                $this.removeData('imageupload');
            });
	    }
	};

    $.fn.imageupload = function() {
        var method = arguments[0];

        if(methods[method]) {
            method = methods[method];
            arguments = Array.prototype.slice.call(arguments, 1);
        } else if( typeof(method) == 'object' || !method ) {
            method = methods.init;
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.imageupload' );
            return this;
        }

        return method.apply(this, arguments);

    }    

    var defaults = $.fn.imageupload.defaults = {
        modalId: 'uploadModal',
        submitButton: 'submit-button',
        fileInputWrapper: 'gdn-file-input',
        fileInputId: 'input_file',
        uploadUrl: 'server/php/',
        formId: 'fileupload',
        uploadCancel: 'btn-upload-cancel',
        doCrop: true,
        cropUrl: 'server/php/image_crop_and_size.php',
        imgPreview: 'img-preview'
    };
    var options = $.extend(defaults, $.fn.imageupload.options);
    
    var disableSubmit = function() {
	    $('.'+options.submitButton).prop('disabled', true);
    };
    
    var enableSubmit = function() {
	    $('.'+options.submitButton).prop('disabled', false);
    };

    var showFileInputWrapper = function() {
        $('.'+options.fileInputWrapper).show();
        disableSubmit();
    };

    var updatePreview = function(c) {
        if (parseInt(c.w) > 0) {
            var rx = xsize / c.w;
            var ry = ysize / c.h;

            $pimg.css({
              width: Math.round(rx * boundx) + 'px',
              height: Math.round(ry * boundy) + 'px',
              marginLeft: '-' + Math.round(rx * c.x) + 'px',
              marginTop: '-' + Math.round(ry * c.y) + 'px'
            });
            cropCoordinates.c=c;
            enableSubmit();
        }
    };

    var modal = $('#'+options.modalId);
    modal.on("hidden", function(){	
        if (jcrop_api != undefined) {	
            jcrop_api.release();
            updatePreview(d);
        }
        $('.files').html('');
        $('.'+options.fileInputWrapper).show();
        disableSubmit();
        $('.preview').removeClass('preview-cropped');
    });
    
    $(document).on('click', '.'+options.submitButton, function(e) {
        if (options.doCrop) {
            if (jcrop_api != undefined) {	
                $.ajax({
                    url: options.cropUrl,
                    data: cropCoordinates,
                    type: 'POST',
                    dataType: 'JSON',
                    success: function(data) {
                        $img = '<img src="'+data.url+'" alt="Profile picture" />'
                        $('.'+options.imgPreview).html($img);
                        $('#'+options.modalId).modal('hide');
                    }
                });
            }
        }
    });
    
    
})(jQuery);
