﻿$(document).ready(function () {
    $('body').on('click', '#btnUpload', function () {
        $("#fileError").remove();
        disableButton();
        // Checking whether FormData is available in browser
        if (window.FormData !== undefined) {
            var fileUpload = $("#FileUpload1").get(0);
            var files = fileUpload.files;
            if (files.length === 0) {
                $("#btnContainer").append('<span id="fileError" class="msgColor">Please select a zip file.</span>');
                enableButton();
                return;
            }
            else {
                $("#fileError").html('');
            }
            // Create FormData object
            var fileData = new FormData();

            // Looping over all files and add it to FormData object
            for (var i = 0; i < files.length; i++) {
                fileData.append(files[i].name, files[i]);
            }

            //$('#gitHubCheckboxDiv').addClass('d-none');
            //$('input[id="gitHubCheckbox"]').prop('checked', false);

            $.ajax({
                url: '/Environment/UploadFiles',
                type: "POST",
                contentType: false, // Not to set any content header
                processData: false, // Not to process data
                data: fileData,
                success: function (result) {
                   
                    if (result[0] !== "") {
                        //alert("succesfully uploaded file: " + files[0].name);
                        console.log("succesfully uploaded file: " + result[0]);                        
                        $.post("UnzipFile", { "fineName": result[0] }, function (Data) {
                            if (Data.responseMessage === "SUCCESS") {
                                //alert("succesfully unzipped file: " + files[0].name);
                                console.log("succesfully unzipped file: " + files[0].name);

                                var NewTemplateName = files[0].name.replace(".zip", "");
                                //$('#ddlTemplates', parent.document).val(NewTemplateName);
                                //$('#selectedTemplateFolder', parent.document).val(NewTemplateName);
                                //$(".template-close", parent.document).click();
                                //$(".VSTemplateSelection", parent.document).removeClass('d-block').addClass('d-none');
                                //$("#lblextensionError", parent.document).removeClass('d-block').addClass('d-none');
                                //$("#lblDefaultDescription", parent.document).removeClass('d-block').addClass('d-none');
                                //$("#lblDescription", parent.document).removeClass('d-block').addClass('d-none');
                                //$("#ddlAcccountName", parent.document).prop('selectedIndex', 0);
                                $('#ddlTemplates', parent.document).val(NewTemplateName);
                                $('#selectedTemplateFolder', parent.document).val(Data.privateTemplateName);
                                $(".template-close", parent.document).click();
                                $(".VSTemplateSelection", parent.document).removeClass('d-block').addClass('d-none');
                                $("#lblextensionError", parent.document).removeClass('d-block').addClass('d-none');
                                $("#lblDefaultDescription", parent.document).removeClass('d-block').addClass('d-none');
                                $("#lblDescription", parent.document).removeClass('d-block').addClass('d-none');
                                $("#ddlAcccountName", parent.document).prop('selectedIndex', 0);
                                $('#gitHubCheckboxDiv', parent.document).addClass('d-none');

                                $('#PrivateTemplateName', parent.document).val(NewTemplateName);
                                $('#PrivateTemplatePath', parent.document).val(Data.privateTemplatePath);
                                enableButton();
                            }
                            else if (Data.responseMessage !== null && Data.responseMessage !== "") {
                                var msg = '';
                                if (Data.responseMessage === "PROJECTANDSETTINGNOTFOUND") {
                                    msg = 'ProjectSetting and ProjectTemplate files not found! plase include the files in zip and try again';
                                }
                                else if (Data.responseMessage === "SETTINGNOTFOUND") {
                                    msg = 'ProjectSetting file not found! plase include the files in zip and try again';
                                }
                                else if (Data.responseMessage === "PROJECTFILENOTFOUND") {
                                    msg = 'ProjectTemplate file not found! plase include the files in zip and try again';
                                }
                                else if (Data.responseMessage === "ISPRIVATEERROR") {
                                    msg = 'IsPrivate flag is not set to true inProjectTemplate file, update the flag and try again.';
                                }
                                else {
                                    msg = Data.responseMessage;
                                }
                                $("#urlerror").empty().append(msg);
                                enableButton();
                                return;
                            }
                        });
                    }
                },
                error: function (err) {
                    alert(err.statusText);
                }
            });
        } else {
            alert("FormData is not supported.");
        }
    });

    $('body').on('click', '#btnURLUpload, #btnGitHubUpload', function () {
        var isUrlValid = false;
        var URL = '';
        if ($('#GitHubUrl').val() !== '') {
            URL = $('#GitHubUrl').val();
        } else if ($('#FileURL').val() !== '') {
            URL = $('#FileURL').val();
        }
        if (URL === '') {
            $("#urlerror").empty().append('URL should not be empty');
            return false;
        }
        var controlID = this.id;
       
        var GitHubtoken = $('#GitHubToken').val();
        var userId = $('#UserId').val();
        var password = $('#Password').val();
        $("#urlerror").empty();
        //$("#urluploaderror").empty().append('URL should not be empty');
        //$("#urlgithuberror").empty().append('URL github should not be empty');
        //$("#urlothererror").empty().append('URL other should not be empty');
        var fileurlSplit = URL.split('/');
        var filename = fileurlSplit[fileurlSplit.length - 1];
        filename = filename.split('.');
        if (filename.length === 2) {
            if (filename[1].toLowerCase() !== "zip") {
                $("#urlerror").empty().append('Enter zip file URL'); isUrlValid = false;
            } else {
                isUrlValid = true;
            }
        }
        if (controlID === 'btnGitHubUpload') {
            if (fileurlSplit[2].toLowerCase() !== "raw.githubusercontent.com") {
                $("#urlerror").empty().append('Please provide GitHub raw URL, which should starts with domain name raw.githubusercontent.com '); isUrlValid = false;

            }
        }
        var oldTemplate = $('#PrivateTemplateName', parent.document).val();
        if (isUrlValid) {
            $.ajax({
                url: "../Environment/UploadPrivateTemplateFromURL",
                type: "GET",
                data: { TemplateURL: URL, token: GitHubtoken, userId: userId, password: password, OldPrivateTemplate: oldTemplate },
                success: function (Data) {
                    if (Data.privateTemplatePath !== "" && Data.privateTemplatePath !== undefined) {
                        console.log(Data);
                        var msg = '';
                        if (Data.responseMessage === "SUCCESS") {
                            $('#PrivateTemplateName', parent.document).val(Data.privateTemplateName);
                            $('#PrivateTemplatePath', parent.document).val(Data.privateTemplatePath);
                            var NewTemplateName = filename[0];
                            $('#ddlTemplates', parent.document).val(NewTemplateName);
                            $('#selectedTemplateFolder', parent.document).val(NewTemplateName);
                            $(".template-close", parent.document).click();
                            $(".VSTemplateSelection", parent.document).removeClass('d-block').addClass('d-none');
                            $("#lblextensionError", parent.document).removeClass('d-block').addClass('d-none');
                            $("#lblDefaultDescription", parent.document).removeClass('d-block').addClass('d-none');
                            $("#lblDescription", parent.document).removeClass('d-block').addClass('d-none');
                            $("#ddlAcccountName", parent.document).prop('selectedIndex', 0);
                            $('#gitHubCheckboxDiv', parent.document).addClass('d-none');
                        }
                        else if (Data.responseMessage === "PROJECTANDSETTINGNOTFOUND") {
                            msg = 'ProjectSetting and ProjectTemplate files not found! plase include the files in zip and try again';
                        }
                        else if (Data.responseMessage === "SETTINGNOTFOUND") {
                            msg = 'ProjectSetting file not found! plase include the files in zip and try again';
                        }
                        else if (Data.responseMessage === "PROJECTFILENOTFOUND") {
                            msg = 'ProjectTemplate file not found! plase include the files in zip and try again';
                        }
                        else if (Data.responseMessage === "ISPRIVATEERROR") {
                            msg = 'IsPrivate flag is not set to true inProjectTemplate file, update the flag and try again.';
                        }
                        else {
                            msg = Data.responseMessage;
                        }
                        if (msg !== '' && msg !== 'SUCCESS') {
                            $("#urlerror").empty().append(msg);
                            return;
                        }
                    }

                }

            });
        }
      
    });
});
function disableButton() {
    $('#btnUpload').attr('disabled', 'disabled').removeClass('btn-primary');
}
function enableButton() {
    $('#btnUpload').attr('disabled', false).addClass('btn-primary');
}
