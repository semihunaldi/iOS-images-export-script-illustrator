/**
 * Author: Pieter Meiresone
 */
#include "json2.js"

var selectedAppIconArtboards = {};
var selectedAppIconExportOptions = {};
var selectedImageExportOptions = {};

var iosAppIconExportOptions = [
    {
        name: "Icon-29@2.png",
        size: 58,
        type: "Spotlight iOS 5,6; Settings iOS 5 - 8",
        idiom: "iphone",
        sizeJSON: "29x29",
        scale: "2x"
    },
    {
        name: "Icon-60@2.png",
        size: 120,
        type: "Home screen on iPhone/iPod Touch with retina display",
        idiom: "iphone",
        sizeJSON: "60x60",
        scale: "2x"
    },
    {
        name: "Icon-60@3.png",
        size: 180,
        type: "Home screen on iPhone 6 Plus",
        idiom: "iphone",
        sizeJSON: "60x60",
        scale: "3x"
    },
    {
        name: "Icon-76.png",
        size: 76,
        type: "Home screen on iPad",
        idiom: "ipad",
        sizeJSON: "76x76",
        scale: "1x"
    },
    {
        name: "Icon-76@2.png",
        size: 152,
        type: "Home screen on iPad with retina display",
        idiom: "ipad",
        sizeJSON: "76x76",
        scale: "2x"
    },
    // {
    //     name: "Icon-Small-40",
    //     size: 40,
    //     type: "Spotlight",
    //     idiom: "iphone",
    //     sizeJSON: "40x40",
    //     scale: "1x"
    // },
    {
        name: "Icon-Small-40@2.png",
        size: 80,
        type: "Spotlight on devices with retina display",
        idiom: "iphone",
        sizeJSON: "40x40",
        scale: "2x"
    },
    {
        name: "Icon-Small-40@3.png",
        size: 120,
        type: "Spotlight on iPhone 6 Plus",
        idiom: "iphone",
        sizeJSON: "40x40",
        scale: "3x"
    }
];

var iosImageExportOptions = [
    {
        name: "",
        scaleFactor: 100,
        type: "1x"
    },
    {
        name: "@2x",
        scaleFactor: 200,
        type: "2x"
    },
    {
        name: "@3x",
        scaleFactor: 300,
        type: "3x"
    }
];

var folder = Folder.selectDialog("Select export directory");
var document = app.activeDocument;

if(document && folder) {
    var dialog = new Window("dialog","Select export sizes");
    var osGroup = dialog.add("group");

    var appIconArtboardCheckboxes = createAppIconSelectionPanel(osGroup);
    var iosCheckboxes = createSelectionPanel("App Icon", iosAppIconExportOptions, selectedAppIconExportOptions, osGroup);
    var imageCheckboxes = createSelectionPanel("Images", iosImageExportOptions, selectedImageExportOptions, osGroup);

    var buttonGroup = dialog.add("group");
    var okButton = buttonGroup.add("button", undefined, "Export");
    var cancelButton = buttonGroup.add("button", undefined, "Cancel");
    
    okButton.onClick = function() {
        exportAppIcons();
        exportImages();

        this.parent.parent.close();
    };
    
    cancelButton.onClick = function () {
        this.parent.parent.close();
    };

    dialog.show();
}

function exportAppIcons() {
    for (var artboardName in selectedAppIconArtboards) {
        var artboard = app.activeDocument.artboards.getByName(artboardName);
        var activeIndex = 0;
        while (!(app.activeDocument.artboards[activeIndex].name === artboardName)) {
            activeIndex++;
        }
        app.activeDocument.artboards.setActiveArtboardIndex(i);


        var expFolder = new Folder(folder.fsName + "/" + artboard.name + ".appiconset" + "/");
        if (!expFolder.exists) {
            expFolder.create();
        }

        var jsonFileObject = {
            images: [],
            info: {
                version: 1,
                author: "xcode"
            }
        };

        for(var key in selectedAppIconExportOptions) {
            var item = selectedAppIconExportOptions[key];
            jsonFileObject.images.push({
                idiom: item.idiom,
                size: item.sizeJSON,
                filename: item.name,
                scale: item.scale
            });
        }

        var jsonFile = new File(expFolder.fsName + "/Contents.json");
        jsonFile.open("w");
        jsonFile.write(JSON.stringify(jsonFileObject, null, 2));
        jsonFile.close();

        for (var key in selectedAppIconExportOptions) {
            var item = selectedAppIconExportOptions[key];
            exportAppIcon(artboard, expFolder, item.name, item.size, item.type);
        }
    }
};

function exportAppIcon(artboard, expFolder, name, iconSize, type) {
    var scale = iconSize * 100 / Math.abs(artboard.artboardRect[1] - artboard.artboardRect[3]);
	
	if ( app.documents.length > 0 ) 
	{
		var exportOptions = new ExportOptionsPNG24();
		var type = ExportType.PNG24;
		var fileSpec = new File(expFolder.fsName + "/" + name);
		exportOptions.verticalScale = scale;
		exportOptions.horizontalScale = scale;
		exportOptions.antiAliasing = true;
		exportOptions.transparency = true;
		exportOptions.artBoardClipping = true;
		app.activeDocument.exportFile (fileSpec, type, exportOptions);
	}
};

function exportImages() {
    for (var i = 0; i < app.activeDocument.artboards.length; i++) {
        var activeArtboard = app.activeDocument.artboards[i];

        if (!selectedAppIconArtboards.hasOwnProperty(activeArtboard.name)) {
            app.activeDocument.artboards.setActiveArtboardIndex(i);
            
            var expFolder = new Folder(folder.fsName + "/" + activeArtboard.name + ".imageset" + "/");
            if (!expFolder.exists) {
                expFolder.create();
            }

            var jsonFileObject = {
                images: [],
                info: {
                    version: 1,
                    author: "xcode"
                }
            };

            for(var key in selectedImageExportOptions) {
                var item = selectedImageExportOptions[key];
                jsonFileObject.images.push({
                    idiom: "universal",
                    scale: item.type,
                    filename: activeArtboard.name + item.name + ".png"
                });
            }

            var jsonFile = new File(expFolder.fsName + "/Contents.json");
            jsonFile.open("w");
            jsonFile.write(JSON.stringify(jsonFileObject, null, 2));
            jsonFile.close();

            for (var key in selectedImageExportOptions) {
                if (selectedImageExportOptions.hasOwnProperty(key)) {
                    var item = selectedImageExportOptions[key];
                    exportImage(expFolder, activeArtboard, item.name, item.scaleFactor, item.type)
                }
            }
        }
    }
};

function exportImage(expFolder, activeArtboard, name, scale, type) {
    var exportOptions = new ExportOptionsPNG24();
    var type = ExportType.PNG24;
    var fileSpec = new File(expFolder.fsName + "/" + activeArtboard.name + name + ".png");
    exportOptions.verticalScale = scale;
    exportOptions.horizontalScale = scale;
    exportOptions.antiAliasing = true;
    exportOptions.transparency = true;
    exportOptions.artBoardClipping = true;
    app.activeDocument.exportFile (fileSpec, type, exportOptions);
};

function createAppIconSelectionPanel(parent) {
    var panel = parent.add("panel", undefined, "Select App Icons");
    panel.alignChildren = "left";
    for (var i = 0; i < app.activeDocument.artboards.length; i++) {
        var cb = panel.add("checkbox", undefined, "\u00A0" + app.activeDocument.artboards[i].name)
        cb.item = app.activeDocument.artboards[i];
        cb.value = false;
        cb.onClick = function() {
            if (this.value) {
                selectedAppIconArtboards[this.item.name] = this.item;
            } else {
                delete selectedAppIconArtboards[this.item.name];
            }
        };
    }
};

function createSelectionPanel(name, array, selected, parent) {
    var panel = parent.add("panel", undefined, name);
    panel.alignChildren = "left";
    for(var i = 0; i < array.length;  i++) {
        var cb = panel.add("checkbox", undefined, "\u00A0" + array[i].type);
        cb.item = array[i];
        cb.value = true;
        cb.onClick = function() {
            if(this.value) {
                selected[this.item.name] = this.item;
                //alert("added " + this.item.name);
            } else {
                delete selected[this.item.name];
                //alert("deleted " + this.item.name);
            }
        };
        selected[array[i].name] = array[i];
    }
};