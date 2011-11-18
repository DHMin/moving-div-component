(function() {
	var _moveDivSelector = '_moveArea_';
	var _tempDivId = '_empty_div_';
	// flag valuables
	var isMoving = false;
	var enableMoving = false;
	var emptyColumId = '';
	// copy div element to move other columns
	var $moveDiv = null;
	var $cloneDiv = null;
	
	var movingDivComponent =  {
		_moveDiv : function(id) {
			var column_id = id;
			var height = '20px';
			
			var divEl = document.createElement('div');
			divEl.setAttribute('data-sel', _moveDivSelector);
			divEl.setAttribute('data-column', column_id);
			
			var style = 'height:'+height+';';
			style += 'border:1px solid red;';
			style += 'cursor:move';
			divEl.setAttribute('style',  style);
			
			divEl.innerHTML = "Drag this area";
			
			return divEl;
		},
		
		_getBodyDiv : function($div) {
			// make div and copy inner text.
			var divEl = document.createElement('div');
			divEl.innerHTML = $div.html();
			
			// make original div empty
			$div.empty().html('');
			
			return divEl;
		},
		
		_getInnerDiv : function(moveEl, bodyEl) {
			var divEl = document.createElement('div');
			divEl.setAttribute('style','position:relative;');
			
			// add two div components
			divEl.appendChild(moveEl);
			divEl.appendChild(bodyEl);
			
			return divEl;
		},
		
		_attachEvent : function() {
			$('[data-sel="'+_moveDivSelector+'"]').live('mousedown', function(e) {
				var i;
				var $this = $(this);
				var $parent = $this.parent();
				var coluum_id = $parent.attr('data-column');
				var offsetX = e.offsetX;
				var offsetY = e.offsetY;
				
				// calculate columns position
				var $columns = $('[data-column="true"]');
				var columns = [];
				// check offset of columns;
				for( i = 0; i < $columns.length; i++) {
					var $column = $($columns[i]);
					var offset = $column.offset();
					var c_id = $column.attr('id');
					var c_left = offset.left;
					var c_right = c_left + $column.width();
					var c_top = offset.top;
					var c_bottom = c_top + $column.height();
				
					columns.push( {
						id : c_id,
						left : c_left,
						right : c_right,
						top : c_top,
						bottom : c_bottom
					});
				}
				
				var $tempDiv = $(document.createElement('div'));
				$tempDiv.attr('id', _tempDivId);
				$tempDiv.css('height', $parent.height() + 'px');
				
				// prevent to select text
				// when user move mouse after mousedown event
				$(document).bind('selectstart', onPreventSelecting = function() {
					return false;
				});
				
				// copy div element for attaching after moving
				$cloneDiv = $parent.clone();
				var width = $parent.width();
				// copy div element for moving;
				$moveDiv = $parent.clone();
				$moveDiv.attr('id', '__moving_div_element__');
				$moveDiv.css('position', 'absolute');
				$moveDiv.css('display', 'none');
				$moveDiv.css('z-index', '100');
				$moveDiv.css('width', width);
				
				$('body').append($moveDiv);
				

				// fill column with empty div element
				// to keep shape of columns
				$('#'+coluum_id).append($tempDiv);
				// make current column empty
				$parent.remove();
				
				// first moving div element
				$moveDiv.css( {
					top : (e.pageY - offsetY) + 'px',
					left : (e.pageX - offsetX) + 'px'
				});
				$moveDiv.css('display', 'block');
				
				// set flag
				enableMoving = true;
				
				var lastColumn = coluum_id;
				$('[data-column="true"]').bind('mouseover', onIntoColumn = function(e) {
					var $this = $(this);
					if( lastColumn == $this.attr('id') )
						return ;
					
					// change empty column
					var $temp = $('#'+_tempDivId);
					var $changDiv = $this.find('div:first');
					$changDiv.attr('data-column', lastColumn);
					var $old_emptyColumn = $temp.parent();
					var $new_emptyColumn = $this;
					
					$old_emptyColumn.append($changDiv);
					$new_emptyColumn.append($temp);
					
					lastColumn = $this.attr('id');
					//console.log('in div ' , $(this).attr('id'));
				});
				
				// attach mouse move event
				$('body').bind('mousemove', onDivMove = function (e) {
					if(enableMoving !== true)
						return;
					
					$moveDiv.css('display', 'none');

					// set moving flag
					isMoving = true;
					
					// moving
					$moveDiv.css( {
						top : (e.pageY - offsetY) + 'px',
						left : (e.pageX - offsetX) + 'px'
					});
					$moveDiv.css('display', 'block');
					
					// check that mouse moves into columns area
					for(i = 0; i < columns.length; i++) {
						var c = columns[i];
						if( (e.pageX > c.left && e.pageX < c.right) 
							&& (e.pageY > c.top && e.pageY < c.bottom)) {
							$('#'+c.id).trigger('mouseover');
						}
					}
				});
				
				// attach div to column
				// when mouseup event occur.
				$('body').bind('mouseup', function(e) {
					if( enableMoving !== true )
						return false;
					
					// set flag 
					isMoving = false;
					enableMoving = false;
					
					// append current moving div element to empty column
					var $temp = $('#'+_tempDivId);
					var $attachColumn = $temp.parent();
					$temp.remove();
					$cloneDiv.attr('data-column', $attachColumn.attr('id'));
					$attachColumn.append($cloneDiv);
					$cloneDiv = null;
					
					// remove moving div element
					$moveDiv.remove();
					$moveDiv = null;
					
					// dispatch all events
					$('body').unbind('mousemove', onDivMove);
					$('[data-column="true"]').unbind('mouseover', onIntoColumn);
					$(document).unbind('selectstart', onPreventSelecting);
				});
			});
		},
		
		init : function() {
			var $div;
			var i = 0;
			var width = Math.floor(100/arguments.length);
			
			// divide the 'div' areas as a moving space
			// each div is one column.
			for( i = 0; i < arguments.length; i++ ) {
				$div = $('#'+arguments[i]);
				$div.css('width', width+'%')
					.css('float', 'left');
				$div.attr('data-column', 'true');
				
				// rearrange div elements
				var moveEl = this._moveDiv(arguments[i]);
				var bodyEl = this._getBodyDiv($div);
				var $newDiv = $(this._getInnerDiv(moveEl, bodyEl));
				$newDiv.attr('data-column', arguments[i]);
				
				$div.append($newDiv);
			}
			
			this._attachEvent();
		}
	};
	
	if( typeof exports !== 'undefined') {
		exports.movingDivComponent = movingDivComponent;
	} else {
		window.movingDivComponent = movingDivComponent;
	}
})();