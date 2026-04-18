<?php

?>

<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
.wrapper {
  display: flex;  
  flex-flow: row wrap;
  font-weight: bold;
  text-align: center; 
}

.wrapper > * {
  padding: 10px;
  flex: 1 100%;
}

.header {
  background: tomato;
}

.footer {
  background: lightgreen;
}

.main {
  text-align: left;
  background: deepskyblue;
}

.aside-1 {
  background: gold;
}

.aside-2 {
  background: hotpink;
}

@media all and (min-width: 600px) {
  .aside { flex: 1 0 0; }
}

@media all and (min-width: 800px) {
  .main    { flex: 3 0px; }
  .aside-1 { order: 1; } 
  .main    { order: 2; }
  .aside-2 { order: 3; }
  .footer  { order: 4; }
}

body {
  padding: 2em; 
}

</style>
</head>
<body>
<!--
<div class="wrapper">
  <header class="header">Header</header>
  <article class="main">
    <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.</p>  
  </article>
  <aside class="aside aside-1">Aside 1</aside>
  <aside class="aside aside-2">Aside 2</aside>
  <footer class="footer">Footer</footer>
</div>
-->
<br><br>

<div class="wrapper">
  <header class="header">Header</header>
  <article class="main">
	
	<p id="myP">Test</p>
	<div id="wg-api-football-games"
		 data-host="v3.football.api-sports.io"
		 data-key=""
		 data-date=""
		 data-league=""
		 data-season=""
		 data-theme=""
		 data-refresh="15"
		 data-show-toolbar="true"
		 data-show-errors="false"
		 data-show-logos="false"
		 data-modal-game="true"
		 data-modal-standings="true"
		 data-modal-show-logos="true">
	</div>
	<script
		type="module"
		src="http://127.0.0.1/api-v3/test-widgets/games/widgets.js">
	</script>
	
	
	
  </article>
  <aside class="aside aside-1">Aside 1</aside>
  <aside class="aside aside-2">Aside 2</aside>
  <footer class="footer">Footer</footer>
</div>



<script>
// Dropdown Menu
var dropdown = document.querySelectorAll('.dropdown');
var dropdownArray = Array.prototype.slice.call(dropdown,0);
dropdownArray.forEach(function(el){
	var button = el.querySelector('a[data-toggle="dropdown"]'),
			menu = el.querySelector('.dropdown-menu'),
			arrow = button.querySelector('i.icon-arrow');

	button.onclick = function(event) 
	{
		if(!menu.hasClass('show')) 
		{
			menu.classList.add('show');
			menu.classList.remove('hide');
			arrow.classList.add('open');
			arrow.classList.remove('close');
			event.preventDefault();
		} else {
			menu.classList.remove('show');
			menu.classList.add('hide');
			arrow.classList.remove('open');
			arrow.classList.add('close');
			event.preventDefault();
		}
	};
})

Element.prototype.hasClass = function(className) 
{
    return this.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(this.className);
};
</script>

</body>
</html>