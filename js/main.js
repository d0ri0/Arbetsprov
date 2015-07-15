function pad(number) {
	if (number < 10) {
		return '0' + number;
	}
	return number;
}

function getCurrentDateTime() {

	// // short one-liner, but does not format output according to wireframe
	// return new Date().toLocaleString();

	var currentDateTime = new Date();

	// correctly formated
	return currentDateTime.getFullYear() +
		'-' + pad(currentDateTime.getMonth() + 1) +
		'-' + pad(currentDateTime.getDate()) +
		' ' + pad(currentDateTime.getHours()) +
		':' + pad(currentDateTime.getMinutes());

}

// Clearable input
function tog(v) {
	return v ? 'addClass' : 'removeClass';
}


// Delay throttle function.
var delay = (function() {
	var timer = 0;
	return function(callback, ms) {
		clearTimeout(timer);
		timer = setTimeout(callback, ms);
	};
})();


// GitHub search rate limit: 10 requests per minute
// Sort default: results are sorted by best match.
// Order default: desc.
// https://developer.github.com/v3/search/
function searchGithub(keyword) {

	// Dont search for blank string
	if (keyword.length === 0) {
		clearSearchInput();
		return;
	}

	// show activity indicator
	$("#searchResults tbody").html('<tr><td><span class="glyphicon glyphicon-refresh spin" aria-hidden="true"></span> Loading...</td></tr>');


	$.getJSON("https://api.github.com/search/repositories", {
			// sanitizes input
			"q": keyword
		},
		function(data) {

			if (data.items.length) {
				var items = [];
				$.each(data.items, function(key, val) {

					var sanitizedDescription = $('<div>' + val.description + '</div>').text();

					items.push('<tr data-project_name="' + val.name + '"><td><a href="' + val.html_url + '" target="_blank">' + val.name + '</a> - ' + sanitizedDescription + '</td></tr>');
				});

				$("#searchResults tbody").html(items.join(""));
			} else {
				$("#searchResults tbody").html('<tr><td>No results were found.</td></tr>');
			}

		}).fail(function() {
			alert('There was a problem with GitHub API response.');
		}
	);
}

function setupInputsClearIcon() {
	$(document).on('input', '.clearable', function() {

		$(this)[tog(this.value)]('x');

	}).on('mousemove', '.x', function(e) {

		$(this)[tog(this.offsetWidth - 18 < e.clientX - this.getBoundingClientRect().left)]('onX');

	}).on('touchstart click', '.onX', function(ev) {
		ev.preventDefault();

		$(this).removeClass('x onX').val('').change();

		if ($(this).is(searchInput)) {
			clearSearchInput();
		}

	});
}

function clearSearchInput() {
	$("#searchResults tbody").empty();
	searchInput.val('').focus();
}

$(document).ready(function() {

	// Frequently used variables
	searchInput = $('input#searchWord');
	savedResults = $('#savedResults');


	setupInputsClearIcon();

	searchInput.keyup(function() {

		// Set a delay so we are not spamming GitHub API
		// as there is a search rate limit
		delay(function() {

			searchGithub(searchInput.val());

		}, 800);

	});

	// Detect keyboard ENTER press
	$(document).keydown(function(e) {
		if (e.keyCode == 13) {

			var selectedRow = $('#searchResults tr.success:first');

			// If user has selected a row, save it to the list.
			if (selectedRow.length) {

				var projectName = selectedRow.data('project_name');
				selectedRow.removeClass('success');

				$('<tr><td><strong>' + projectName + '</strong> <span class="pull-right">' + getCurrentDateTime() + '</span></td></tr>').appendTo('#savedResults tbody');
				savedResults.removeClass('hidden');


			} else {
				alert("You haven't selected any row.");
			}
		}
	})

	// Toggle highlight on clicked row
	$(document).on('click', '#searchResults tr', function() {

		$(this)
			.toggleClass('success')
			.siblings()
			.removeClass('success');

	});

});
