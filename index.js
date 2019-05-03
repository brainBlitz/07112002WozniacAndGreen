
var tagList = loadEntries("t", "nextTagNum");
var displayTagList = tagList;
var activeIcons = {tagBar: true, newTagMaker: false, tagEditor: false, tagFilter: false, tagEditorWaiting: false, deleteTag: false}
var selectedTags = [];
updateTags();

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

if (localStorage.getItem("nextTagNum") === null) {
	localStorage.setItem("nextTagNum", 0)
	localStorage.setItem("nextQuoteNum", 0)
}

function loadEntries(startChar, break_Key) {
	entriesList = [];
	var breakNum = localStorage.getItem(break_Key);
	for(var i = 0; i < breakNum; i++) {
		var entry = localStorage.getItem(startChar + i.toString());
		if (entry === 0) {
			entriesList.push(0);
		} else {
			entriesList.push(JSON.parse(entry));
		}
	}
	return entriesList;
}

function tagC(tagName, colour) {
	this.quoteNums = [];
	this.selected = false;
	this.num = parseInt(localStorage.getItem("nextTagNum"));
	this.tagName = tagName;
	this.colour = colour;	
}

function a() {
	for(var i = 0; i < localStorage.getItem('nextTagNum'); i++) {
		delta = JSON.parse(localStorage.getItem('t' + i.toString()));
		delta.quoteNums = [];
		localStorage.setItem('t' + i.toString(), JSON.stringify(delta));
	}
}
//a();

function updateTags() {
	var tagBarContainer = document.getElementById("tagBarContainer");
	var oldTagBar = document.getElementById('tagBar');
	saveScroll = oldTagBar.scrollTop;
	var tagBar = document.createElement("div");
	tagBar.id = "tagBar";
	for(var i = 0; i < displayTagList.length; i++) {
		if (displayTagList[i] !== 0) {
			if (selectedTags[0] != undefined) {
				var specificDot = displayTagList[i].num == selectedTags[0].num ? 'selDot' : 'selDotHidden';	
			} else {
				var specificDot = 'selDotHidden';
			}
			var tagContainer = document.createElement("div");
			tagContainer.className = "tagContainer";
			tagContainer.id = `tag_${displayTagList[i].num}`;

			tagContainer.innerHTML = `
			<button class="tag normalTag" style="background-color: ${displayTagList[i].colour}" name="${displayTagList[i].num}" onClick="tagClicked(this)">
				<div class="tagText">${displayTagList[i].tagName}</div>
				<div class="tagCount tagCountNormal"> ${displayTagList[i].quoteNums.length}</div>
				<i class='fas fa-circle ${specificDot}' id='dot_${displayTagList[i].num}'></i>
			</button>
			`
			if (displayTagList[i].selected) {
				tagContainer.firstElementChild.className = "tag selectedTag";
				tagContainer.firstElementChild.firstElementChild.className = "tagText selectedTagText";
			}
			tagBar.appendChild(tagContainer);
		}
	}
	tagBarContainer.replaceChild(tagBar, oldTagBar);
	tagBar.scrollTop = saveScroll;
	if (activeIcons.tagEditor && displayTagList.indexOf(selectedTags[0]) != -1) {
		activeIcons.tagEditor = false;
		tagMaker(false);
	}
	if (activeIcons.newTagMaker) {
		activeIcons.newTagMaker = false;
		tagMaker(true);
	}
	if (selectedTags.length != 0 && !activeIcons.tagEditor) {
		var selTagContainer = document.getElementById(`tag_${selectedTags[0].num}`);
		var selDot = document.getElementById(`dot_${selectedTags[0].num}`);
		selDot.style["margin-top"] = ((selTagContainer.offsetHeight / 2)-6).toString() + 'px';
	}
}

function tagMaker(isNew) {
	if (isNew) {
		var editorID = 'newTagMaker'; var iconID = 'newTagIconText'; var iconType = 'tag';
	} else {
		var editorID = 'tagEditor'; var iconID = 'tagEditIconText'; var iconType = 'pen';
	}
	
	if (activeIcons[editorID]) {
		wipeTagMaker(editorID, iconID, iconType, isNew);
	} else {

		var tagIcon = document.getElementById(iconID);
		activeIcons[editorID] = true;
		tagIcon.className = `fas fa-${iconType} toolText toolTextSelected`;

		if (isNew) {
			var tagName = ''; var colour = '#ffffff'; var butText = 'Create'; var tagCountEditable = '0'
		} else {
			if (selectedTags.length == 0) {
				activeIcons.tagEditorWaiting = true;
				return;
			}
			var editTag = selectedTags[0]
			var editTagEl = document.getElementById(`tag_${editTag.num}`);
			var tagName = editTag.tagName; var colour = editTag.colour; var butText = 'Edit';
			var tagCountEditable = "<button type='button' class='toolBox' id='deleteTagButton' onClick='deleteTag()'><i class='fas fa-trash-alt bin'></i></button>";
		}

		var tagBar = document.getElementById('tagBar');
		var tagMaker = document.createElement("form");
		tagMaker.id = editorID;
		if (!isNew) {
			tagMaker.innerHTML = `
			<hr class='editRule extra'> `
		}
			
		tagMaker.innerHTML += `
		<div class='tagContainer'>
			<div id='${editorID}editableTagShape' class='tag editableTag' style="background-color: ${colour};">
				<input type='text' id='${editorID}tagNameInput' class = 'tagNameInput' autocomplete="off" spellcheck=true value='${tagName}'>
				<div class="tagCount tagCountEditable">${tagCountEditable}</div>
			</div>
		</div>
		<input type='submit' id='${editorID}submitTag' class = 'submitTag' value='${butText}' onfocusout="submitTagText('${editorID}','${butText}')";>
		<input type="color" value='${colour}' id="${editorID}colorPicker" class = 'colorPicker'>
		<hr class='editRule'>
		`
		if (isNew) {
			tagBar.insertBefore(tagMaker,tagBar.firstChild);
		} else {
			tagBar.replaceChild(tagMaker, editTagEl);
		}
		setNewTagListeners(isNew, editorID, iconID, iconType, editTag);
	}
}

function setNewTagListeners(isNew, editorID, iconID, iconType, editTag) {
	var colorPicker = document.getElementById(`${editorID}colorPicker`);
	colorPicker.addEventListener("input", function (event) {
		document.getElementById(`${editorID}editableTagShape`).style["background-color"] = event.target.value;
	});

	document.getElementById(editorID).addEventListener('submit', function (event) {
		var tagNameInput = document.getElementById(`${editorID}tagNameInput`);	
		event.preventDefault();

		var duplicateName = false;
		for (var i = 0; i < tagList.length; i++) {
			if (tagList[i].tagName == tagNameInput.value && i != selectedTags[0].num) {
				duplicateName = true;
			}
		};

		if (tagNameInput.value.length < 1 || duplicateName) {
			submitTagText(editorID,'Try Again');
			return;
		} else {
			if (isNew) {
				var newTag = new tagC(tagNameInput.value, colorPicker.value);
				localStorage.setItem("nextTagNum", newTag.num + 1);
				localStorage.setItem(("t" + newTag.num.toString()), JSON.stringify(newTag));
				tagList.push(newTag);
			} else {
				editTag.tagName = tagNameInput.value;
				editTag.colour = colorPicker.value;
				editTag.selected = false;
				localStorage.setItem(("t" + editTag.num.toString()), JSON.stringify(editTag));
				editTag.selected = true;
				tagList[editTag.num] = editTag;
			}
			wipeTagMaker(editorID, iconID, iconType, isNew);
			updateTags();
		}	

	});
}

function submitTagText(editorID, text) {
	document.getElementById(`${editorID}submitTag`).value = text;
}

function wipeTagMaker(editorID, iconID, iconType, isNew) {
	var newTagIcon = document.getElementById(iconID);
	newTagIcon.className = `fas fa-${iconType} toolText toolTextNormal`;
	activeIcons[editorID] = false;
	if (isNew) {
		document.getElementById(editorID).remove();
	} else {
		updateTags()
		if (activeIcons.tagEditorWaiting) {
			activeIcons.tagEditorWaiting = false;
		}
	}
}

function tagClicked(tagEl) {
	tag = tagList[parseInt(tagEl.name)];
	if (tag.selected) {
		selectedTags = selectedTags.filter(el => el.num != tag.num);
		tag.selected = false;
	} else {
		selectedTags.unshift(tag);
		tag.selected = true;

		if (activeIcons.tagEditorWaiting) {
			activeIcons.tagEditor = false;
			activeIcons.tagEditorWaiting = false;
			tagMaker(false);
		}
	}
	updateTags();
}

function getToggleTagToolEls() {
	var filterIcon = document.getElementById('filterIcon');
	var searchIcon = document.getElementById('searchIcon');
	var searchBar = document.getElementById('filterVsearch');
	return {filterIcon, searchIcon, searchBar};
}

function switchToFilter() {
	if (!activeIcons.tagFilter) {
		getToggleTagToolEls();
		filterIcon.className = 'fas fa-filter backNforth backNforthSelected';
		searchIcon.className = 'fas fa-search backNforth backNforthNormal';
		filterVsearch.innerHTML = `
		<select class='searchNfilterBar filter'>
			<option>by creation: 1st to last</option>
			<option>by creation: last to 1st</option>
			<option>by # of tags: descending</option>
			<option>by # of tags: ascending</option>
		</select>
		`
		activeIcons.tagFilter = true;
	}
}

function switchToSearch() {
	if (activeIcons.tagFilter) {
		getToggleTagToolEls()
		filterIcon.className = 'fas fa-filter backNforth backNforthNormal';
		searchIcon.className = 'fas fa-search backNforth backNforthSelected';
		filterVsearch.innerHTML = `
			<input type="text" id="searchBar" class="searchNfilterBar search" autocomplete="off" placeholder="Search Tags" spellcheck=true onInput="updateSearch()">
		`
		activeIcons.tagFilter = false;
	}
}

function updateSearch() {
	var searchVal = document.getElementById('searchBar').value;
	searchVal = searchVal.replace(/^\s+|\s+$/g, "");
	if (searchVal != '') {
		displayTagList = [];
		var search = new RegExp(searchVal.replace(/ /g, '|'), "i");
		for(var i = 0; i < tagList.length; i++) {
			if (search.test(tagList[i].tagName)) {
				displayTagList.push(tagList[i]);
			}	
		}
	} else {
		displayTagList = tagList;
	}
	updateTags();
}

function deleteTag() {
	if (!activeIcons.deleteTag) {
		activeIcons.deleteTag = true;
		document.getElementById('deleteTagButton').firstElementChild.className = 'fas fa-trash-alt binSelected';

		var delTag = selectedTags[0];
		var delAlertYref = document.getElementById('tagEditor').getBoundingClientRect().top;

		var blockout = document.createElement('div');
		blockout.id = 'blockout';
		blockout.className = 'blockout';

		var deleteAlertContainer = document.createElement('div');
		var deleteAlert = document.createElement('div');
		deleteAlert.id = 'deleteAlert';
		deleteAlert.style.top = delAlertYref + 'px';
		deleteAlert.style.transform = 'translateY(calc(-50% + 30px))';
		deleteAlert.innerHTML = `
		<div id = 'deleteAlertText'>
			Are you sure you want to <b>delete</b> this tag? <b>${selectedTags[0].tagName.capitalize()}</b> will be removed from all tagged quotes.
		</div>
		<div id='confirmVcancel'>
			<button class = 'confirmVcancelButton'  onClick = "deleteConfirmHandler(false)">
				 <span class='cancel'>Cancel</span> <i class="fas fa-times-circle cancel"></i>
			</button>
			<button class = 'confirmVcancelButton'  onClick = "deleteConfirmHandler(true)">
				 <span class='confirm'>Confirm</span> <i class="fas fa-check-circle confirm"></i>
			</button>
		</div>
		`
		document.body.appendChild(blockout);
		deleteAlertContainer.appendChild(deleteAlert);
		document.body.appendChild(deleteAlertContainer);

		if (deleteAlert.getBoundingClientRect().bottom > window.innerHeight) {
			deleteAlert.style.top = '100vh';
			deleteAlert.style.transform = 'translateY(calc(-100% - 10px))';
		}
	}
}

function deleteConfirmHandler(deleteBool) {
	document.getElementById('deleteAlert').remove();
	document.getElementById('blockout').remove();
	activeIcons.deleteTag = false;
	if (deleteBool) {
		delTag = selectedTags[0];
		selectedTags.shift();
		tagList[delTag.num] = 0;
		localStorage.setItem(("t" + delTag.num.toString()), 0);
		wipeTagMaker('tagEditor', 'tagEditIconText', 'pen', false);
		updateSearch();
		updateTags();
	} else {
		document.getElementById('deleteTagButton').firstElementChild.className = 'fas fa-trash-alt bin';
	}
}

function toggleTagBar() {
	if (activeIcons.tagBar) {
		toggleTagBarHelper(false, 'fas fa-align-left toolText toolTextSelected', 'none', '75px')
	} else {
		toggleTagBarHelper(true, 'fas fa-align-left toolText toolTextNormal', 'block', '20.5vw')
	}
}
function toggleTagBarHelper(active, selected, display, width) {
		activeIcons.tagBar = active;
		document.getElementById('tagBarToggleText').className = selected;
		document.getElementById('newTagIconBox').style.display = display;
		document.getElementById('tagEditIconBox').style.display = display;
		document.getElementById('tools1').style.width = width;
		document.getElementById('tagBarContainer').style.display = display;
}


//aa
//localStorage.setItem('nextQuoteNum', 0);

var quoteList = loadEntries("q", "nextQuoteNum");
displayQuoteList = quoteList;
updateQuotes();

function quoteC(quoteText, author, notes, tagNums) {
	this.quoteText = quoteText;
	this.author = author;
	this.notes = notes;
	this.tagNums = tagNums;
	this.num = parseInt(localStorage.getItem("nextQuoteNum"));
}


function b() {
	for(var i = 0; i < localStorage.getItem('nextQuoteNum'); i++) {
		delta = JSON.parse(localStorage.getItem('q' + i.toString()));
		//
		localStorage.setItem('q' + i.toString(), JSON.stringify(delta));
	}
}
//b();
function c() {
	newQuote = localStorage.getItem("q1");
	var newQuote = new quoteC('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Proin nibh nisl condimentum id venenatis a. In aliquam sem fringilla ut morbi tincidunt augue interdum. Velit laoreet id donec ultrices tincidunt arcu non sodales. Dignissim diam quis enim lobortis scelerisque fermentum dui faucibus in.','Lorem Ipsum','eh',[0]);
	localStorage.setItem("q1", JSON.stringify(newQuote));
}
//c();
function d() {
	var newQuote = new quoteC('fire and blood and anguish','Priestley','eh',[0]);
	localStorage.setItem("nextQuoteNum", newQuote.num + 1);
	localStorage.setItem(("q" + newQuote.num.toString()), JSON.stringify(newQuote));
	quoteList.push(newQuote);
}
//d();


function updateQuotes() {
	var quoteFeedContainer = document.getElementById('quoteFeedContainer');
	var oldQuoteFeed = document.getElementById('quoteFeed');
	var saveScroll = oldQuoteFeed.scrollTop;
	var quoteFeed = document.createElement("div");
	quoteFeed.id = "quoteFeed";

	for(var i = 0; i < displayQuoteList.length; i++) {
		if (displayQuoteList[i] !== 0) {
			
			var quoteBox = document.createElement("div");
			quoteBox.className = "quoteBox";
			quoteBox.id = `quote_${displayQuoteList[i].num}`;
			quoteBox.innerHTML = `
				<div class='author'>
					<div class='authorText'>
						-  ${displayQuoteList[i].author}
					</div>
				</div>
				<div class='quoteText'>
					<div class='metaQuoteText'>
						${displayQuoteList[i].quoteText}
					</div>
				</div>
				
			`
			quoteFeed.appendChild(quoteBox);
		}
	}
	quoteFeedContainer.replaceChild(quoteFeed, oldQuoteFeed);
	quoteFeed.scrollTop = saveScroll;
}


