var _scryfall = "https://api.scryfall.com";
var _googleTranslate = "https://translation.googleapis.com/language/translate/v2";
var _allLanguages = [{ language: "af", name: "Afrikaans" }, { language: "sq", name: "Albanian" }, { language: "am", name: "Amharic" }, { language: "ar", name: "Arabic" }, { language: "hy", name: "Armenian" }, { language: "az", name: "Azerbaijani" }, { language: "eu", name: "Basque" }, { language: "be", name: "Belarusian" }, { language: "bn", name: "Bengali" }, { language: "bs", name: "Bosnian" }, { language: "bg", name: "Bulgarian" }, { language: "ca", name: "Catalan" }, { language: "ceb", name: "Cebuano" }, { language: "ny", name: "Chichewa" }, { language: "zh", name: "Chinese (Simplified)" }, { language: "zh-TW", name: "Chinese (Traditional)" }, { language: "co", name: "Corsican" }, { language: "hr", name: "Croatian" }, { language: "cs", name: "Czech" }, { language: "da", name: "Danish" }, { language: "nl", name: "Dutch" }, { language: "en", name: "English" }, { language: "eo", name: "Esperanto" }, { language: "et", name: "Estonian" }, { language: "tl", name: "Filipino" }, { language: "fi", name: "Finnish" }, { language: "fr", name: "French" }, { language: "fy", name: "Frisian" }, { language: "gl", name: "Galician" }, { language: "ka", name: "Georgian" }, { language: "de", name: "German" }, { language: "el", name: "Greek" }, { language: "gu", name: "Gujarati" }, { language: "ht", name: "Haitian Creole" }, { language: "ha", name: "Hausa" }, { language: "haw", name: "Hawaiian" }, { language: "iw", name: "Hebrew" }, { language: "hi", name: "Hindi" }, { language: "hmn", name: "Hmong" }, { language: "hu", name: "Hungarian" }, { language: "is", name: "Icelandic" }, { language: "ig", name: "Igbo" }, { language: "id", name: "Indonesian" }, { language: "ga", name: "Irish" }, { language: "it", name: "Italian" }, { language: "ja", name: "Japanese" }, { language: "jw", name: "Javanese" }, { language: "kn", name: "Kannada" }, { language: "kk", name: "Kazakh" }, { language: "km", name: "Khmer" }, { language: "ko", name: "Korean" }, { language: "ku", name: "Kurdish (Kurmanji)" }, { language: "ky", name: "Kyrgyz" }, { language: "lo", name: "Lao" }, { language: "la", name: "Latin" }, { language: "lv", name: "Latvian" }, { language: "lt", name: "Lithuanian" }, { language: "lb", name: "Luxembourgish" }, { language: "mk", name: "Macedonian" }, { language: "mg", name: "Malagasy" }, { language: "ms", name: "Malay" }, { language: "ml", name: "Malayalam" }, { language: "mt", name: "Maltese" }, { language: "mi", name: "Maori" }, { language: "mr", name: "Marathi" }, { language: "mn", name: "Mongolian" }, { language: "my", name: "Myanmar (Burmese)" }, { language: "ne", name: "Nepali" }, { language: "no", name: "Norwegian" }, { language: "ps", name: "Pashto" }, { language: "fa", name: "Persian" }, { language: "pl", name: "Polish" }, { language: "pt", name: "Portuguese" }, { language: "pa", name: "Punjabi" }, { language: "ro", name: "Romanian" }, { language: "ru", name: "Russian" }, { language: "sm", name: "Samoan" }, { language: "gd", name: "Scots Gaelic" }, { language: "sr", name: "Serbian" }, { language: "st", name: "Sesotho" }, { language: "sn", name: "Shona" }, { language: "sd", name: "Sindhi" }, { language: "si", name: "Sinhala" }, { language: "sk", name: "Slovak" }, { language: "sl", name: "Slovenian" }, { language: "so", name: "Somali" }, { language: "es", name: "Spanish" }, { language: "su", name: "Sundanese" }, { language: "sw", name: "Swahili" }, { language: "sv", name: "Swedish" }, { language: "tg", name: "Tajik" }, { language: "ta", name: "Tamil" }, { language: "te", name: "Telugu" }, { language: "th", name: "Thai" }, { language: "tr", name: "Turkish" }, { language: "uk", name: "Ukrainian" }, { language: "ur", name: "Urdu" }, { language: "uz", name: "Uzbek" }, { language: "vi", name: "Vietnamese" }, { language: "cy", name: "Welsh" }, { language: "xh", name: "Xhosa" }, { language: "yi", name: "Yiddish" }, { language: "yo", name: "Yoruba" }, { language: "zu", name: "Zulu" }];
var _sourceLanguage = { language: "en", name: "English" };
var _costPerChar = 20.00 / 1000000.0;
var _numFlavorLines;
var _artist;
var _translatorLanguages;

$(document).ready(function ()
{
    _allLanguages = _allLanguages.filter(function(value)
    {
        return value.language !== _sourceLanguage.language;
    });

    $("#setselection, #load, #present").hide();
    $("#edition").change(editionChanged);
    $("#iterations").change(iterationsChanged);
    $("#translate").click(translateClicked);
    $("#random").click(randomClicked);
    initializeCardAutoComplete();
});

function initializeCardAutoComplete()
{
    $("#cardname").autocomplete(
    {
        minLength: 3,
        select: autocompleteCardNameSelected,
        source: function (request, response)
        {
            $.getJSON(_scryfall + "/cards/autocomplete?q=" + encodeURIComponent(request.term), function (json)
            {
                response(json.data);
            });
        }
    }); 
}

function autocompleteCardNameSelected(event, ui)
{
    $("#cardname").val(ui.value);
    setTimeout(enteredCardName, 10);
}

function enteredCardName(event)
{
    if (event)
    {
        event.preventDefault();
        event.stopPropagation();
    }

    $("#setselection").hide();
    $("#edition").empty();

    var cardname = $("#cardname").val();
    
    $.getJSON(_scryfall + "/cards/search?q=" + encodeURIComponent("++!") + "\"" + encodeURIComponent(cardname) + "\"", function (response)
    {
        var data = response.data;

        $("#cardname").val(data[0].name);

        for (var i = 0; i < data.length; i++)
        {
            var ed = data[i].set_name;
            var uri = data[i].uri;
            var charCount = safeLength(data[i].name) + safeLength(data[i].type_line) + safeLength(data[i].oracle_text) + safeLength(data[i].flavor_text);

            $("#edition").append($('<option></option>').val(uri).html(ed).attr("data-url", data[i].image_uris["normal"]).attr("data-charcount", charCount).attr("data-scryfallid", data[i].id).attr("data-artist", data[i].artist));
            
            if (i === 0) $(".cardimg").attr("src", data[i].image_uris["normal"]);
        }

        estimateCost();
        $("#timeleft").hide();
        $("#setselection").show();
    });
}

function randomClicked()
{
    $.getJSON(_scryfall + "/cards/random", function(response)
    {
        $("#cardname").val(response.name);
        enteredCardName();
    });
}

function editionChanged()
{
    $(".cardimg").attr("src", $("#edition :selected").attr("data-url"));
    estimateCost();
}

function iterationsChanged()
{
    estimateCost();
}

function safeLength(str)
{
    return str ? str.length : 0;
}

function estimateCost()
{
    $("#estimatedcost").html(($("#edition :selected").attr("data-charcount") * $("#iterations").val() * 2.0 * _costPerChar).toFixed(2));
}

function translateClicked()
{
    $("#cardselection, #setselection").hide();
    $("#load, #present").show();

    var scryfallId = $("#edition :selected").attr("data-scryfallid");
    $("#progress").progressbar({ value: 0.0 });
    
    $.getJSON(_scryfall + "/cards/" + scryfallId, function(response)
    {
        var name = response.name;
        var typeLine = response.type_line;
        var rulesLines = response.oracle_text ? response.oracle_text.split("\n") : [];
        var flavorLines = response.flavor_text ? response.flavor_text.split("\n") : [];
        _artist = response.artist;
        _numFlavorLines = flavorLines.length;

        _translatorLanguages = shuffle(_allLanguages).slice(0, $("#iterations").val() - 1);
        var i = 0;
        while (i < _translatorLanguages.length)
        {
            _translatorLanguages.splice(i, 0, _sourceLanguage);
            i += 2;
        }
        _translatorLanguages.push(_sourceLanguage);

        var sourceText = name + "\n" + typeLine + "\n" + rulesLines.join("\n") + "\n" + flavorLines.join("\n");
        showTranslation(sourceText, _sourceLanguage.name, -1);
        translate(sourceText, 0);
    });
}

function translate(text, iter)
{
    if (iter === (parseInt($("#iterations").val()) - 1) * 2)
    {
        $("#load").hide();
        showTranslation(text, _translatorLanguages[iter].name, iter);
        return;
    }

    var url = _googleTranslate + "?key=" + $("#apikey").val() + "&q=" + encodeURIComponent(text) +
        "&source=" + _translatorLanguages[iter].language + "&target=" + _translatorLanguages[iter + 1].language + "&format=text";

    $.getJSON(url, function(response)
    {
        showTranslation(response.data.translations[0].translatedText, _translatorLanguages[iter + 1].name, iter);
        translate(response.data.translations[0].translatedText, iter + 1);
        $("#progress").progressbar({ value: 100.0 * iter / ((parseFloat($("#iterations").val()) - 1) * 2) });
    });
}

function showTranslation(translatedText, language, iter)
{
    var lines = translatedText.split("\n");
    var name = lines[0];
    var typeLine = lines[1];
    var rulesLines = lines.slice(2, lines.length - _numFlavorLines);
    var flavorLines = _numFlavorLines !== 0 ? lines.slice(-_numFlavorLines) : [];

    var intermediate = iter > 0 && iter % 2 === 1;
    var div = cardDiv(name, typeLine, rulesLines, flavorLines, _artist, language, intermediate);
    if (intermediate) $("#results").append($("<div></div>").html("&rarr;").addClass("arrowright"));
    $("#results").append(div);
    if (intermediate || iter === -1) $("#results").append($("<div></div>").html("&darr;").addClass("arrowdown"));
}

function cardDiv(name, typeLine, rulesLines, flavorLines, artist, language, intermediate)
{
    var div = $("<div></div>").addClass("card");
    if (intermediate) div.addClass("intermediate");
    div.append(cardLine(language, "language"));
    div.append(cardLine(toTitleCase(name), "name"));
    div.append(cardLine(toTitleCase(typeLine), "type"));
    for (var i = 0; i < rulesLines.length ; i++)
        div.append(cardLine(rulesLines[i], "rules", "rules-" + (i + 1)));
    for (var j = 0; j < flavorLines.length; j++)
        div.append(cardLine(flavorLines[j], "flavor", "flavor-" + (j + 1)));
    div.append(cardLine(artist, "artist"));
    return div;
}

function cardLine(text, class1, class2, class3)
{
    return $("<div></div>").addClass(class1).addClass(class2).addClass(class3).html(text.replace(/\{/g, "[").replace(/\}/g, "]")).click(lineClicked);
}

function lineClicked()
{
    copyToClipboard($(this).html());
    $(this).fadeTo(200, 0.5, "linear");
}

// Adapted from: https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
function copyToClipboard(str)
{
    var el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

// Source: https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--)
    {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

// Source: https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
function toTitleCase(str)
{
    return str.replace(
        /\w\S*/g,
        function (txt)
        {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}
