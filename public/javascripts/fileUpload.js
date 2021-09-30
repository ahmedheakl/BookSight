FilePond.registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginImageResize,
  FilePondPluginFileEncode
);

FilePond.setOptions({
  stylePanelAspectRatio: 290 / 200,
  imageResizeTargetWidth: 200,
  imageResizeTargetHeight: 266,
});

FilePond.parse(document.body);
