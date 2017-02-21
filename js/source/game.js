$(document).ready(function(){
	// Use to clone a array
	function clone(src) {
		function mixin(dest, source, copyFunc) {
			var name, s, i, empty = {};
			for(name in source){
				// the (!(name in empty) || empty[name] !== s) condition avoids copying properties in "source"
				// inherited from Object.prototype.	 For example, if dest has a custom toString() method,
				// don't overwrite it with the toString() method that source inherited from Object.prototype
				s = source[name];
				if(!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))){
					dest[name] = copyFunc ? copyFunc(s) : s;
				}
			}
			return dest;
		}

		if(!src || typeof src != "object" || Object.prototype.toString.call(src) === "[object Function]"){
			// null, undefined, any non-object, or function
			return src;	// anything
		}
		if(src.nodeType && "cloneNode" in src){
			// DOM Node
			return src.cloneNode(true); // Node
		}
		if(src instanceof Date){
			// Date
			return new Date(src.getTime());	// Date
		}
		if(src instanceof RegExp){
			// RegExp
			return new RegExp(src);   // RegExp
		}
		var r, i, l;
		if(src instanceof Array){
			// array
			r = [];
			for(i = 0, l = src.length; i < l; ++i){
				if(i in src){
					r.push(clone(src[i]));
				}
			}
			// we don't clone functions for performance reasons
			//		}else if(d.isFunction(src)){
			//			// function
			//			r = function(){ return src.apply(this, arguments); };
		}else{
			// generic objects
			r = src.constructor ? new src.constructor() : {};
		}
		return mixin(r, src, clone);

	}

	// game setting
	
	// ls stand for localstorage
	var size = 10; // size of the chess
	var numOfPlayer = 4;
	var turn = 1; // player's turn
	var learningMode = false; // learning mode will show all the available spots
	var gameEnded = false;

	// get data from localStorage
	// console.log(localStorage["gameSetting"]);
	if (localStorage["gameSetting"] != null && localStorage["gameSetting"] != "") {
		var ls_size = JSON.parse(localStorage["gameSetting"]).size;
		var ls_numOfPlayer = JSON.parse(localStorage["gameSetting"]).numOfPlayer;
		if (ls_size != null && ls_size != "") size = ls_size;
		if (ls_numOfPlayer != null && ls_numOfPlayer != "") numOfPlayer = ls_numOfPlayer;
	}

	$(".numOfPlayer li").removeClass();
	$("#numOfPlayer-"+numOfPlayer).addClass("selected");
	$(".size li").removeClass();
	$("#size-"+size).addClass("selected");


	var MAX_SIZE = 30;

	// create 2dimenional array
	var status = new Array(MAX_SIZE);
	for (var i = 0; i < MAX_SIZE; i++) {
			status[i] = new Array(MAX_SIZE);
	};
	// create 2dimenional array
	var isvalid = new Array(MAX_SIZE);
	for (var i = 0; i < MAX_SIZE; i++) {
			isvalid[i] = new Array(MAX_SIZE);
	};
	// create 2dimenional array
	var pre_status = new Array(MAX_SIZE);
	for (var i = 0; i < MAX_SIZE; i++) {
			pre_status[i] = new Array(MAX_SIZE);
	};
	// create 2dimenional array
	var pre_isvalid = new Array(MAX_SIZE);
	for (var i = 0; i < MAX_SIZE; i++) {
			pre_isvalid[i] = new Array(MAX_SIZE);
	};
	var pre_object;
	$("#back").hide();
	
	// $("#game").hide();

	var changePlayerInfo = function() {
		$(".turn .name").text("Player"+turn);
		$("#player_color").removeClass();
		$("#player_color").addClass("player"+turn);
		var preTurn = turn>1 ? turn-1 : numOfPlayer;
		$("#back").removeClass();
		$("#back").addClass("player"+preTurn);
	}
	var nextTurn = function() {
		turn++;	
		if (turn > numOfPlayer) turn = 1;
		changePlayerInfo();
	}
	var preTurn = function() {
		turn--;	
		if (turn <= 0) turn = numOfPlayer;
		changePlayerInfo();
	}
	var newGame = function() {
		gameEnded = false;
		$("#back").hide();
		if ($("#numOfPlayer").val() != "") {
			// numOfPlayer = $("#numOfPlayer").val();
			numOfPlayer = $(".numOfPlayer .selected").html();
		}
		if ($("#size").val() != "") {
			// size = $("#size").val();
			size = $(".size .selected").html();
		}
		turn = 1;
		changePlayerInfo();
		
		//init status (0 represent nothing)
		for (var i = 0; i < size; i++) {
			for (var j = 0; j < size; j++) {
				status[i][j] = 0;
				pre_status[i][j] = 0;
			};
		};

		//init isvalid to FALSE
		for (var i = 0; i < size; i++) {
			for (var j = 0; j < size; j++) {
				isvalid[i][j] = false;
				pre_isvalid[i][j] = false;
			};
		};
		//top row
		for (var i = 0; i < size; i++) {
			isvalid[0][i] = true;
		};
		//left row
		for (var i = 0; i < size; i++) {
			isvalid[i][0] = true;
		};
		//right row
		for (var i = 0; i < size; i++) {
			isvalid[i][size-1] = true;
		};
		//bottom row
		for (var i = 0; i < size; i++) {
			isvalid[size-1][i] = true;
		};


		$("#wrapper").html("");
		// create check
		var screenWidth = $("#wrapper").width();
		var MARGIN = 2;
		var myWidth = Math.floor(screenWidth/size) - MARGIN*2;
		// console.log("SIZE",size);
		for (var i = 0; i < size; i++) {
			for (var j = 0; j < size; j++) {
				$("#wrapper").append('<div data-row="'+i+'" data-column="'+j+'" class="check"></div>');
				$(".check").css({"width":myWidth,"height":myWidth});
			};
		};

		// get data from localStorage
		if (localStorage["gameStatus"] != null  && localStorage["gameStatus"] != "") {
			if (!JSON.parse(localStorage["gameStatus"]).hasWon) {
				// console.log(JSON.parse(localStorage["gameStatus"]).status);
				var ls_isvalid = JSON.parse(localStorage["gameStatus"]).isvalid;
				var ls_status = JSON.parse(localStorage["gameStatus"]).status;
				var ls_pre_status = JSON.parse(localStorage["gameStatus"]).pre_status;
				var ls_pre_isvalid = JSON.parse(localStorage["gameStatus"]).pre_isvalid;
				var ls_turn = JSON.parse(localStorage["gameStatus"]).turn;
				for (var i = 0; i < size; i++) {
					for (var j = 0; j < size; j++) {
						if (ls_status[i][j] != 0) {
							// console.log('div[data-row="'+i+'"][data-column="'+j+'"]');
							$('div[data-row="'+i+'"][data-column="'+j+'"]').addClass("player"+ls_status[i][j]);
						}
					};
				};	
				isvalid = ls_isvalid;
				status = ls_status;
				pre_status = ls_pre_status;
				pre_isvalid	= ls_pre_isvalid;
				turn = ls_turn;
			}
		}

		// create gameSetting object and save it to localStorage
		var gameSettingForJSON = {
			"numOfPlayer": numOfPlayer,
			"size": size,
		}
		localStorage["gameSetting"] = JSON.stringify(gameSettingForJSON);

		addClassToValidSpots();
	}
	var endGame = function () {
		gameEnded = true;
		for (var i = 0; i < size; i++) {
			for (var j = 0; j < size; j++) {
				isvalid[i][j] = false;
			};
		};
	}
	
	var addClassToValidSpots = () => {
		$(".valid").removeClass("valid");
		for (var i = 0; i < size; i++) {
			for (var j = 0; j < size; j++) {
				if (isvalid[i][j])
					$('div[data-row="'+i+'"][data-column="'+j+'"]').addClass("valid");
			};
		};
	}

	$(window).resize(function(){
		var screenWidth = $("#wrapper").width();
		var MARGIN = 2;
		// var myWidth = Math.floor(screenWidth*0.1);
		var myWidth = Math.floor(screenWidth/size) - MARGIN*2;
		$(".check").css({"width":myWidth,"height":myWidth});
	})
	newGame();
	changePlayerInfo();
	addClassToValidSpots();
	console.log(status);
	// game settings
	$(document).on("click tap",".numOfPlayer li",function() {
		$(".numOfPlayer li").removeClass();
		$(this).addClass("selected");
	})
	$(document).on("click tap",".size li",function() {
		$(".size li").removeClass();
		$(this).addClass("selected");
	})

	

	// gameplay

	var pre_lastClicked; // save the last last clicked move for Back button

	var row,column;
	$(document).on("click tap",".check",function(){
		if (gameEnded) {
			var top = $("#newGame").offset().top;
		    $('html,body').animate({scrollTop:top},300);
		}
		row = $(this).data("row");
		column = $(this).data("column");
		if (isvalid[row][column] == true) {
			pre_status = clone(status); // Save the Previous Chess Status
			pre_isvalid = clone(isvalid);
			$("#back").show();
			pre_object = this;
			$(this).addClass("player"+turn);
			status[row][column] = turn;
			// Add CSS Animation (Notice that it's the last clicked square)
			pre_lastClicked = $(".lastClicked");
			$(".check").removeClass("lastClicked");
			$(this).addClass("lastClicked");

			/** Update isvalid array **/
			var tmp_row, tmp_column;
			//search bottom
			tmp_row = row;

			can = true;
			for (var i = 0; i < row; i++) {
				if (status[i][column]==0) can = false;
			};
			if (can) {
				do {
					if (row!=0 && status[row-1][column]==0)break;
					tmp_row++;
					if (tmp_row>=size) break;
				}
				while (status[tmp_row][column] != 0);
				if (tmp_row<size)
					isvalid[tmp_row][column] = true;
			}

			//search up
			tmp_row = row;
			can = true;
			for (var i = size-1; i > row; i--) {
				if (status[i][column]==0) can = false;
			};
			if (can) {
				do {
					if (row!=size-1 && status[row+1][column]==0)break;
					tmp_row--;
					if (tmp_row<0) break;
				}
				while (status[tmp_row][column] != 0);
				if (tmp_row>=0)
					isvalid[tmp_row][column] = true;
			}

			//search right
			tmp_column = column;
			can = true;
			for (var i = 0; i < column; i++) {
				if (status[row][i]==0) can = false;
				// console.log(column);
			};
			if (can) {
				// console.log("hihi");
				do {
					if (column!=0 && status[row][column-1]==0)break;
					tmp_column++;
					if (tmp_column>=size) break;
				}
				while (status[row][tmp_column] != 0);
				if (tmp_column<size)
					isvalid[row][tmp_column] = true;
			}
			//search left
			tmp_column = column;
			can = true;
			for (var i = size-1; i > column; i--) {
				if (status[row][i]==0) can = false;
			};
			if (can) {
				do {
					if (column!=size-1 && status[row][column+1]==0)break;
					tmp_column--;
					if (tmp_column<0) break;
				}
				while (status[row][tmp_column] != 0);
				if (tmp_column>=0)
					isvalid[row][tmp_column] = true;
			}

			/******************************** 

			Add classes for Learning Mode 

			********************************/
			isvalid[row][column] = false;
			addClassToValidSpots();

			// win or not
			var win = new Array(8);
			var count = 0;
			var streak = 4;

			var hasWon = false;
			function up() { tmp_row--; }
			function down() { tmp_row++; }
			function left() { tmp_column--; }
			function right() { tmp_column++; }
			function isOutOfBox(x,y) {
				var maxCoord = size-1;
				if (x < 0 || x > maxCoord || y < 0 || y > maxCoord) return true;
				else return false;
			}
			function jumpTo(x,y) {
				tmp_row = row;  // by default
				tmp_column = column; // by default
				var steps = streak - 1;
				var maxCoord = size-1;
				// calculate how many steps should move
				if (x == "up") {
					if ((row-steps) < 0 ) steps = row;
				}
				else if (x == "down") {
					if ((row+steps) > maxCoord ) steps = maxCoord-row;
				}

				if (y == "left") {
					if ((column-steps) < 0 ) steps = column;
				}
				else if (y == "right") {
					if ((column+steps) > maxCoord ) steps = maxCoord-column;
				}
				// jump
				if (x == "up") {
					tmp_row = row - steps;
				}
				else if (x == "down") {
					tmp_row = row + steps;	
				}
				if (y == "left") {
					tmp_column = column - steps;
				}
				else if (y == "right") {
					tmp_column = column + steps;
				}
				if (tmp_row > size) tmp_row = size;
				if (tmp_column > size) tmp_column = size;
				if (tmp_row < 0) tmp_row = 0;
				if (tmp_column < 0) tmp_column = 0;
			}
			var won = {
				top_left_bottom_right: false,
				top_right_bottom_left: false,
				top_bottom: false,
				left_right: false,
			}

			// top left to bottom right
			jumpTo("up","left");
			count = 0;
			for (var i = 0; i < 7; i++) {
				if (status[tmp_row][tmp_column] == turn) {
					count++;
					if (count == streak) {
						hasWon = true;
						won.top_left_bottom_right = true;
					}
				} else count = 0;
				down();
				right();
				if (isOutOfBox(tmp_row,tmp_column)) break;
			};


			// top right to bottom left
			jumpTo("up","right");
			count = 0;
			for (var i = 0; i < 7; i++) {
				if (status[tmp_row][tmp_column] == turn) {
					count++;
					if (count == streak) {
						hasWon = true;
						won.top_right_bottom_left = true;
					}
				} else count = 0;
				down();
				left();
				if (isOutOfBox(tmp_row,tmp_column)) break;
			};
			// left to right
			jumpTo("","left")
			count = 0;
			for (var i = 0; i < 7; i++) {
				if (status[tmp_row][tmp_column] == turn) {
					count++;
					if (count == streak) {
						hasWon = true;
						won.left_right = true;
					}
				} else count = 0;
				right();
				if (isOutOfBox(tmp_row,tmp_column)) break;
			};
			// top to bottom
			jumpTo("up","")
			count = 0;
			for (var i = 0; i < 7; i++) {
				if (status[tmp_row][tmp_column] == turn) {
					count++;
					if (count == streak) {
						hasWon = true;
						won.top_bottom = true;
					}
				} else count = 0;

				down();
				if (isOutOfBox(tmp_row,tmp_column)) break;
			};

			/* end */

			/** Add Animation to the winning streak */
			function resetTmpPos() {
				tmp_row = row;
				tmp_column = column;
			}
			if (won.top_left_bottom_right) {
				$('div[data-row="'+row+'"][data-column="'+column+'"]').addClass("wonStreak");
				resetTmpPos();
				do {
					up();left();
					if (isOutOfBox(tmp_row,tmp_column)) break;
					if (status[tmp_row][tmp_column] == turn) 
						$('div[data-row="'+tmp_row+'"][data-column="'+tmp_column+'"]').addClass("wonStreak");
					else break;
				} while (true);
				resetTmpPos();
				do {
					down();right();
					if (isOutOfBox(tmp_row,tmp_column)) break;
					if (status[tmp_row][tmp_column] == turn) 
						$('div[data-row="'+tmp_row+'"][data-column="'+tmp_column+'"]').addClass("wonStreak");
					else break;
				} while (true);
			}

			if (won.top_right_bottom_left) {
				$('div[data-row="'+row+'"][data-column="'+column+'"]').addClass("wonStreak");
				resetTmpPos();
				do {
					up();right();
					if (isOutOfBox(tmp_row,tmp_column)) break;
					if (status[tmp_row][tmp_column] == turn) 
						$('div[data-row="'+tmp_row+'"][data-column="'+tmp_column+'"]').addClass("wonStreak");
					else break;
				} while (true);
				resetTmpPos();
				do {
					down();left();
					if (isOutOfBox(tmp_row,tmp_column)) break;
					if (status[tmp_row][tmp_column] == turn) 
						$('div[data-row="'+tmp_row+'"][data-column="'+tmp_column+'"]').addClass("wonStreak");
					else break;
				} while (true);
			}

			if (won.top_bottom) {
				$('div[data-row="'+row+'"][data-column="'+column+'"]').addClass("wonStreak");
				resetTmpPos();
				do {
					up();
					if (isOutOfBox(tmp_row,tmp_column)) break;
					if (status[tmp_row][tmp_column] == turn)
						$('div[data-row="'+tmp_row+'"][data-column="'+tmp_column+'"]').addClass("wonStreak");
					else break;
				} while (true);
				resetTmpPos();
				do {
					down();
					if (isOutOfBox(tmp_row,tmp_column)) break;
					if (status[tmp_row][tmp_column] == turn)
						$('div[data-row="'+tmp_row+'"][data-column="'+tmp_column+'"]').addClass("wonStreak");
					else break;
				} while (true);
			}

			if (won.left_right) {
				$('div[data-row="'+row+'"][data-column="'+column+'"]').addClass("wonStreak");
				resetTmpPos();
				do {
					left();
					if (isOutOfBox(tmp_row,tmp_column)) break;
					if (status[tmp_row][tmp_column] == turn) 
						$('div[data-row="'+tmp_row+'"][data-column="'+tmp_column+'"]').addClass("wonStreak");
					else break;
				} while (true);
				resetTmpPos();
				do {
					right();
					if (isOutOfBox(tmp_row,tmp_column)) break;
					if (status[tmp_row][tmp_column] == turn) 
						$('div[data-row="'+tmp_row+'"][data-column="'+tmp_column+'"]').addClass("wonStreak");
					else break;
				} while (true);
			}
			/* Add Animation to the winning streak **/

			// //up
			// win[0]=true;
			// count = 0;
			// for (var i = row-1; i >= 0; i--) {
			// 	if (status[i][column]!=turn) win[0] = false;
			// 	count++;
			// 	if (count==streak-1)break;
			// };
			// if (count<streak-1) win[0] = false;

			// //bottom
			// win[1]=true;
			// count = 0;
			// for (var i = row+1; i < size; i++) {
			// 	if (status[i][column]!=turn) win[1] = false;
			// 	count++;
			// 	if (count==streak-1)break;
			// };
			// if (count<streak-1) win[1] = false;

			// //left
			// win[2]=true;
			// count = 0;
			// for (var i = column-1; i >= 0; i--) {
			// 	console.log(status[row][i]);
			// 	if (status[row][i]!=turn) win[2] = false;
			// 	count++;
			// 	if (count==streak-1)break;
			// };
			// if (count<streak-1) win[2] = false;

			// //right
			// win[3]=true;
			// count = 0;
			// for (var i = column+1; i < size; i++) {
			// 	if (status[row][i]!=turn) win[3] = false;
			// 	count++;
			// 	if (count==streak-1)break;
			// };
			// if (count<streak-1) win[3] = false;

			// // top left
			// win[4]=true;
			// count = 0;
			// tmp_column = column;
			// tmp_row = row;
			// for (var i = 0; i < streak-1; i++) {
			// 	if (tmp_row<=0 || tmp_column<=0) {
			// 		win[4]=false;
			// 		break;
			// 	}
			// 	tmp_row--;
			// 	tmp_column--;
			// 	if (status[tmp_row][tmp_column]!=turn) win[4] = false; 
			// };

			// // top right
			// win[5]=true;
			// count = 0;
			// tmp_column = column;
			// tmp_row = row;
			// for (var i = 0; i < streak-1; i++) {
			// 	if (tmp_row<=0 || tmp_column>=size-1) {
			// 		win[5]=false;
			// 		break;
			// 	}
			// 	tmp_row--;
			// 	tmp_column++;
			// 	if (status[tmp_row][tmp_column]!=turn) win[5] = false; 
			// };

			// // bottom left
			// win[6]=true;
			// count = 0;
			// tmp_column = column;
			// tmp_row = row;
			// for (var i = 0; i < streak-1; i++) {
			// 	if (tmp_row>=size-1 || tmp_column<=0) {
			// 		win[6]=false;
			// 		break;
			// 	}
			// 	tmp_row++;
			// 	tmp_column--;
			// 	if (status[tmp_row][tmp_column]!=turn) win[6] = false; 
			// };

			// // bottom right
			// win[7]=true;
			// count = 0;
			// tmp_column = column;
			// tmp_row = row;
			// for (var i = 0; i < streak-1; i++) {
			// 	if (tmp_row>=size-1 || tmp_column>=size-1) {
			// 		win[7]=false;
			// 		break;
			// 	}
			// 	tmp_row++;
			// 	tmp_column++;
			// 	if (status[tmp_row][tmp_column]!=turn) win[7] = false; 
			// };

			//check if has won


			// hasWon = false;
			// for (var i = 0; i < 8; i++) { // check 8 direction
			// 	if (win[i]==true) hasWon = true;
			// };
			if (hasWon) {
				// alert("Player"+turn+" won!");
				swal({
					title: "Congratulations!",
					text: "Player"+turn+" won the game!",
				})
				endGame();
				$("#back").hide();
			}
			else {
				nextTurn();
			}

			

			// Create gameStatus object and save it to localStorage
			var gameStatusForJSON = {
				"turn": turn,
				"status": status,
				"isvalid": isvalid,
				"pre_status": pre_status,
				"pre_isvalid": pre_isvalid,
				"hasWon": hasWon
			}
			localStorage["gameStatus"] = JSON.stringify(gameStatusForJSON);
			// console.log(localStorage["gameStatus"]);
		}
	})

	$("#new_game").click(function(){
		if ($("#numOfPlayer").val() <= 1) {
			alert("At least 2 players");
		}
		else if ($("#size").val() < 5 || $("#size").val() > 30) {
			alert("Range of size: 5-30");	
		}
		else {
			swal({
				title: "Are you sure to start a new game?",
				text: "You will not be able to recover this game progress!",
				type: "info",
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: "Yes, start a new game!",
				closeOnConfirm: true
			},
			function(){
				$("#game").show();
				// new game new gameStatus
				localStorage["gameStatus"] = "";
				newGame();
			});
			// if (window.confirm("Are you sure to start a new game?")) {
			// 		$("#game").show();
			// 		newGame();
			// }
		}

	})

	$("#back").click(function(){
		status = clone(pre_status);
		isvalid = clone(pre_isvalid);
		addClassToValidSpots();
		preTurn();
		$(pre_object).removeClass("player"+turn);
		console.log(pre_object);
		$(".check").removeClass("lastClicked");
		$(pre_lastClicked).addClass("lastClicked");
		$("#back").hide();
		// $(this).addClass("player"+turn);
		return false;
	})

	$("#learning_mode").click(function(){
		//toggle
		if (learningMode) learningMode = false;
		else learningMode = true;

		if (learningMode) {
			$("#wrapper").addClass("learningMode");
			$("#learning_mode").addClass("checked");
			$("#learning_mode").text("Learning Mode: On");
		}
		else {
			$("#wrapper").removeClass("learningMode");
			$("#learning_mode").removeClass("checked");
			$("#learning_mode").text("Learning Mode: Off");
		}

	})
})