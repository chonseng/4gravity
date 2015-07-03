$(document).ready(function(){
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
	var size = 10;
	var maxSize = 30;
	var turn = 1;
	var numOfPlayer = 4;
	// create 2dimenional array
	var status = new Array(maxSize);
	for (var i = 0; i < maxSize; i++) {
			status[i] = new Array(maxSize);
	};
	// create 2dimenional array
	var isvalid = new Array(maxSize);
	for (var i = 0; i < maxSize; i++) {
			isvalid[i] = new Array(maxSize);
	};
	// create 2dimenional array
	var pre_status = new Array(maxSize);
	for (var i = 0; i < maxSize; i++) {
			pre_status[i] = new Array(maxSize);
	};
	// create 2dimenional array
	var pre_isvalid = new Array(maxSize);
	for (var i = 0; i < maxSize; i++) {
			pre_isvalid[i] = new Array(maxSize);
	};
	var pre_object;
	$("#back").hide();
	
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
		$("#back").hide();
		if ($("#numOfPlayer").val() != "") {
			// numOfPlayer = $("#numOfPlayer").val();
			numOfPlayer = $(".numberOfPlayer .selected").html();
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

		for (var i = 0; i < size; i++) {
			for (var j = 0; j < size; j++) {
				$("#wrapper").append('<div data-row="'+i+'" data-column="'+j+'" class="check"></div>');
				$(".check").css({"width":myWidth,"height":myWidth});
			};
		};
	}
	var endGame = function () {
		for (var i = 0; i < size; i++) {
			for (var j = 0; j < size; j++) {
				isvalid[i][j] = false;
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

	// game settings
	$(document).on("click tap",".numberOfPlayer li",function() {
		$(".numberOfPlayer li").removeClass();
		$(this).addClass("selected");
	})
	$(document).on("click tap",".size li",function() {
		$(".size li").removeClass();
		$(this).addClass("selected");
	})

	// gameplay

	

	var row,column;
	$(document).on("click tap",".check",function(){
		row = $(this).data("row");
		column = $(this).data("column");
		if (isvalid[row][column] == true) {
			pre_status = clone(status);
			pre_isvalid = clone(isvalid);
			$("#back").show();
			pre_object = this;
			$(this).addClass("player"+turn);
			status[row][column] = turn;
			

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

			// win or not
			var win = new Array(8);
			var count = 0;
			var streak = 4;
			//up
			win[0]=true;
			count = 0;
			for (var i = row-1; i >= 0; i--) {
				if (status[i][column]!=turn) win[0] = false;
				count++;
				if (count==streak-1)break;
			};
			if (count<streak-1) win[0] = false;

			//bottom
			win[1]=true;
			count = 0;
			for (var i = row+1; i < size; i++) {
				if (status[i][column]!=turn) win[1] = false;
				count++;
				if (count==streak-1)break;
			};
			if (count<streak-1) win[1] = false;

			//left
			win[2]=true;
			count = 0;
			for (var i = column-1; i >= 0; i--) {
				console.log(status[row][i]);
				if (status[row][i]!=turn) win[2] = false;
				count++;
				if (count==streak-1)break;
			};
			if (count<streak-1) win[2] = false;

			//right
			win[3]=true;
			count = 0;
			for (var i = column+1; i < size; i++) {
				if (status[row][i]!=turn) win[3] = false;
				count++;
				if (count==streak-1)break;
			};
			if (count<streak-1) win[3] = false;

			// top left
			win[4]=true;
			count = 0;
			tmp_column = column;
			tmp_row = row;
			for (var i = 0; i < streak-1; i++) {
				if (tmp_row<=0 || tmp_column<=0) {
					win[4]=false;
					break;
				}
				tmp_row--;
				tmp_column--;
				if (status[tmp_row][tmp_column]!=turn) win[4] = false; 
			};

			// top right
			win[5]=true;
			count = 0;
			tmp_column = column;
			tmp_row = row;
			for (var i = 0; i < streak-1; i++) {
				if (tmp_row<=0 || tmp_column>=size-1) {
					win[5]=false;
					break;
				}
				tmp_row--;
				tmp_column++;
				if (status[tmp_row][tmp_column]!=turn) win[5] = false; 
			};

			// bottom left
			win[6]=true;
			count = 0;
			tmp_column = column;
			tmp_row = row;
			for (var i = 0; i < streak-1; i++) {
				if (tmp_row>=size-1 || tmp_column<=0) {
					win[6]=false;
					break;
				}
				tmp_row++;
				tmp_column--;
				if (status[tmp_row][tmp_column]!=turn) win[6] = false; 
			};

			// bottom right
			win[7]=true;
			count = 0;
			tmp_column = column;
			tmp_row = row;
			for (var i = 0; i < streak-1; i++) {
				if (tmp_row>=size-1 || tmp_column>=size-1) {
					win[7]=false;
					break;
				}
				tmp_row++;
				tmp_column++;
				if (status[tmp_row][tmp_column]!=turn) win[7] = false; 
			};

			//check if has won
			

			hasWon = false;
			for (var i = 0; i < 8; i++) { // check 8 direction
				if (win[i]==true) hasWon = true;
			};
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

			console.log(win);
			// console.log("row",row,"column",column);
			isvalid[row][column] = false;
			console.log("status",status);
			// console.log(isvalid);
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
			if (window.confirm("Are you sure to start a new game?")) {
					newGame();
			}
		}
	})

	$("#back").click(function(){
		status = clone(pre_status);
		isvalid = clone(pre_isvalid);
		preTurn();
		$(pre_object).removeClass("player"+turn);
		$("#back").hide();
		// $(this).addClass("player"+turn);
		return false;
	})
})