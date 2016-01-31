<!DOCTYPE html>
<html>
<head>
  <title>gulp-inject</title>
</head>
<body>

  <!-- without-query-string:js-->
  <script src="<?php echo get_bloginfo('template_directory'); ?>/fixtures/lib.js"></script>
  <!-- endinject-->

  <!-- with-query-string:js-->
  <script src="<?php echo get_bloginfo('template_directory'); ?>/fixtures/lib.js?v=1.0.0"></script>
  <!-- endinject-->

</body>
</html>
