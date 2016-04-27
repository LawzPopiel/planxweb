/* */ 
(function(process) {
  (function() {
    'use strict';
    angular.module('ui.grid.i18n', []);
    angular.module('ui.grid', ['ui.grid.i18n']);
  })();
  (function() {
    'use strict';
    angular.module('ui.grid').constant('uiGridConstants', {
      LOG_DEBUG_MESSAGES: true,
      LOG_WARN_MESSAGES: true,
      LOG_ERROR_MESSAGES: true,
      CUSTOM_FILTERS: /CUSTOM_FILTERS/g,
      COL_FIELD: /COL_FIELD/g,
      MODEL_COL_FIELD: /MODEL_COL_FIELD/g,
      TOOLTIP: /title=\"TOOLTIP\"/g,
      DISPLAY_CELL_TEMPLATE: /DISPLAY_CELL_TEMPLATE/g,
      TEMPLATE_REGEXP: /<.+>/,
      FUNC_REGEXP: /(\([^)]*\))?$/,
      DOT_REGEXP: /\./g,
      APOS_REGEXP: /'/g,
      BRACKET_REGEXP: /^(.*)((?:\s*\[\s*\d+\s*\]\s*)|(?:\s*\[\s*"(?:[^"\\]|\\.)*"\s*\]\s*)|(?:\s*\[\s*'(?:[^'\\]|\\.)*'\s*\]\s*))(.*)$/,
      COL_CLASS_PREFIX: 'ui-grid-col',
      events: {
        GRID_SCROLL: 'uiGridScroll',
        COLUMN_MENU_SHOWN: 'uiGridColMenuShown',
        ITEM_DRAGGING: 'uiGridItemDragStart',
        COLUMN_HEADER_CLICK: 'uiGridColumnHeaderClick'
      },
      keymap: {
        TAB: 9,
        STRG: 17,
        CAPSLOCK: 20,
        CTRL: 17,
        CTRLRIGHT: 18,
        CTRLR: 18,
        SHIFT: 16,
        RETURN: 13,
        ENTER: 13,
        BACKSPACE: 8,
        BCKSP: 8,
        ALT: 18,
        ALTR: 17,
        ALTRIGHT: 17,
        SPACE: 32,
        WIN: 91,
        MAC: 91,
        FN: null,
        PG_UP: 33,
        PG_DOWN: 34,
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        ESC: 27,
        DEL: 46,
        F1: 112,
        F2: 113,
        F3: 114,
        F4: 115,
        F5: 116,
        F6: 117,
        F7: 118,
        F8: 119,
        F9: 120,
        F10: 121,
        F11: 122,
        F12: 123
      },
      ASC: 'asc',
      DESC: 'desc',
      filter: {
        STARTS_WITH: 2,
        ENDS_WITH: 4,
        EXACT: 8,
        CONTAINS: 16,
        GREATER_THAN: 32,
        GREATER_THAN_OR_EQUAL: 64,
        LESS_THAN: 128,
        LESS_THAN_OR_EQUAL: 256,
        NOT_EQUAL: 512,
        SELECT: 'select',
        INPUT: 'input'
      },
      aggregationTypes: {
        sum: 2,
        count: 4,
        avg: 8,
        min: 16,
        max: 32
      },
      CURRENCY_SYMBOLS: ['ƒ', '$', '£', '$', '¤', '¥', '៛', '₩', '₱', '฿', '₫'],
      scrollDirection: {
        UP: 'up',
        DOWN: 'down',
        LEFT: 'left',
        RIGHT: 'right',
        NONE: 'none'
      },
      dataChange: {
        ALL: 'all',
        EDIT: 'edit',
        ROW: 'row',
        COLUMN: 'column',
        OPTIONS: 'options'
      },
      scrollbars: {
        NEVER: 0,
        ALWAYS: 1
      }
    });
  })();
  angular.module('ui.grid').directive('uiGridCell', ['$compile', '$parse', 'gridUtil', 'uiGridConstants', function($compile, $parse, gridUtil, uiGridConstants) {
    var uiGridCell = {
      priority: 0,
      scope: false,
      require: '?^uiGrid',
      compile: function() {
        return {
          pre: function($scope, $elm, $attrs, uiGridCtrl) {
            function compileTemplate() {
              var compiledElementFn = $scope.col.compiledElementFn;
              compiledElementFn($scope, function(clonedElement, scope) {
                $elm.append(clonedElement);
              });
            }
            if (uiGridCtrl && $scope.col.compiledElementFn) {
              compileTemplate();
            } else {
              if (uiGridCtrl && !$scope.col.compiledElementFn) {
                $scope.col.getCompiledElementFn().then(function(compiledElementFn) {
                  compiledElementFn($scope, function(clonedElement, scope) {
                    $elm.append(clonedElement);
                  });
                });
              } else {
                var html = $scope.col.cellTemplate.replace(uiGridConstants.MODEL_COL_FIELD, 'row.entity.' + gridUtil.preEval($scope.col.field)).replace(uiGridConstants.COL_FIELD, 'grid.getCellValue(row, col)');
                var cellElement = $compile(html)($scope);
                $elm.append(cellElement);
              }
            }
          },
          post: function($scope, $elm, $attrs, uiGridCtrl) {
            var initColClass = $scope.col.getColClass(false);
            $elm.addClass(initColClass);
            var classAdded;
            var updateClass = function(grid) {
              var contents = $elm;
              if (classAdded) {
                contents.removeClass(classAdded);
                classAdded = null;
              }
              if (angular.isFunction($scope.col.cellClass)) {
                classAdded = $scope.col.cellClass($scope.grid, $scope.row, $scope.col, $scope.rowRenderIndex, $scope.colRenderIndex);
              } else {
                classAdded = $scope.col.cellClass;
              }
              contents.addClass(classAdded);
            };
            if ($scope.col.cellClass) {
              updateClass();
            }
            var dataChangeDereg = $scope.grid.registerDataChangeCallback(updateClass, [uiGridConstants.dataChange.COLUMN, uiGridConstants.dataChange.EDIT]);
            var cellChangeFunction = function(n, o) {
              if (n !== o) {
                if (classAdded || $scope.col.cellClass) {
                  updateClass();
                }
                var newColClass = $scope.col.getColClass(false);
                if (newColClass !== initColClass) {
                  $elm.removeClass(initColClass);
                  $elm.addClass(newColClass);
                  initColClass = newColClass;
                }
              }
            };
            var rowWatchDereg = $scope.$watch('row', cellChangeFunction);
            var deregisterFunction = function() {
              dataChangeDereg();
              rowWatchDereg();
            };
            $scope.$on('$destroy', deregisterFunction);
            $elm.on('$destroy', deregisterFunction);
          }
        };
      }
    };
    return uiGridCell;
  }]);
  (function() {
    angular.module('ui.grid').service('uiGridColumnMenuService', ['i18nService', 'uiGridConstants', 'gridUtil', function(i18nService, uiGridConstants, gridUtil) {
      var service = {
        initialize: function($scope, uiGridCtrl) {
          $scope.grid = uiGridCtrl.grid;
          uiGridCtrl.columnMenuScope = $scope;
          $scope.menuShown = false;
        },
        setColMenuItemWatch: function($scope) {
          var deregFunction = $scope.$watch('col.menuItems', function(n) {
            if (typeof(n) !== 'undefined' && n && angular.isArray(n)) {
              n.forEach(function(item) {
                if (typeof(item.context) === 'undefined' || !item.context) {
                  item.context = {};
                }
                item.context.col = $scope.col;
              });
              $scope.menuItems = $scope.defaultMenuItems.concat(n);
            } else {
              $scope.menuItems = $scope.defaultMenuItems;
            }
          });
          $scope.$on('$destroy', deregFunction);
        },
        sortable: function($scope) {
          if ($scope.grid.options.enableSorting && typeof($scope.col) !== 'undefined' && $scope.col && $scope.col.enableSorting) {
            return true;
          } else {
            return false;
          }
        },
        isActiveSort: function($scope, direction) {
          return (typeof($scope.col) !== 'undefined' && typeof($scope.col.sort) !== 'undefined' && typeof($scope.col.sort.direction) !== 'undefined' && $scope.col.sort.direction === direction);
        },
        suppressRemoveSort: function($scope) {
          if ($scope.col && $scope.col.suppressRemoveSort) {
            return true;
          } else {
            return false;
          }
        },
        hideable: function($scope) {
          if (typeof($scope.col) !== 'undefined' && $scope.col && $scope.col.colDef && $scope.col.colDef.enableHiding === false) {
            return false;
          } else {
            return true;
          }
        },
        getDefaultMenuItems: function($scope) {
          return [{
            title: i18nService.getSafeText('sort.ascending'),
            icon: 'ui-grid-icon-sort-alt-up',
            action: function($event) {
              $event.stopPropagation();
              $scope.sortColumn($event, uiGridConstants.ASC);
            },
            shown: function() {
              return service.sortable($scope);
            },
            active: function() {
              return service.isActiveSort($scope, uiGridConstants.ASC);
            }
          }, {
            title: i18nService.getSafeText('sort.descending'),
            icon: 'ui-grid-icon-sort-alt-down',
            action: function($event) {
              $event.stopPropagation();
              $scope.sortColumn($event, uiGridConstants.DESC);
            },
            shown: function() {
              return service.sortable($scope);
            },
            active: function() {
              return service.isActiveSort($scope, uiGridConstants.DESC);
            }
          }, {
            title: i18nService.getSafeText('sort.remove'),
            icon: 'ui-grid-icon-cancel',
            action: function($event) {
              $event.stopPropagation();
              $scope.unsortColumn();
            },
            shown: function() {
              return service.sortable($scope) && typeof($scope.col) !== 'undefined' && (typeof($scope.col.sort) !== 'undefined' && typeof($scope.col.sort.direction) !== 'undefined') && $scope.col.sort.direction !== null && !service.suppressRemoveSort($scope);
            }
          }, {
            title: i18nService.getSafeText('column.hide'),
            icon: 'ui-grid-icon-cancel',
            shown: function() {
              return service.hideable($scope);
            },
            action: function($event) {
              $event.stopPropagation();
              $scope.hideColumn();
            }
          }];
        },
        getColumnElementPosition: function($scope, column, $columnElement) {
          var positionData = {};
          positionData.left = $columnElement[0].offsetLeft;
          positionData.top = $columnElement[0].offsetTop;
          positionData.parentLeft = $columnElement[0].offsetParent.offsetLeft;
          positionData.offset = 0;
          if (column.grid.options.offsetLeft) {
            positionData.offset = column.grid.options.offsetLeft;
          }
          positionData.height = gridUtil.elementHeight($columnElement, true);
          positionData.width = gridUtil.elementWidth($columnElement, true);
          return positionData;
        },
        repositionMenu: function($scope, column, positionData, $elm, $columnElement) {
          var menu = $elm[0].querySelectorAll('.ui-grid-menu');
          var renderContainerElm = gridUtil.closestElm($columnElement, '.ui-grid-render-container');
          var renderContainerOffset = renderContainerElm.getBoundingClientRect().left - $scope.grid.element[0].getBoundingClientRect().left;
          var containerScrollLeft = renderContainerElm.querySelectorAll('.ui-grid-viewport')[0].scrollLeft;
          var myWidth = column.lastMenuWidth ? column.lastMenuWidth : ($scope.lastMenuWidth ? $scope.lastMenuWidth : 170);
          var paddingRight = column.lastMenuPaddingRight ? column.lastMenuPaddingRight : ($scope.lastMenuPaddingRight ? $scope.lastMenuPaddingRight : 10);
          if (menu.length !== 0) {
            var mid = menu[0].querySelectorAll('.ui-grid-menu-mid');
            if (mid.length !== 0 && !angular.element(mid).hasClass('ng-hide')) {
              myWidth = gridUtil.elementWidth(menu, true);
              $scope.lastMenuWidth = myWidth;
              column.lastMenuWidth = myWidth;
              paddingRight = parseInt(gridUtil.getStyles(angular.element(menu)[0])['paddingRight'], 10);
              $scope.lastMenuPaddingRight = paddingRight;
              column.lastMenuPaddingRight = paddingRight;
            }
          }
          var left = positionData.left + renderContainerOffset - containerScrollLeft + positionData.parentLeft + positionData.width - myWidth + paddingRight;
          if (left < positionData.offset) {
            left = positionData.offset;
          }
          $elm.css('left', left + 'px');
          $elm.css('top', (positionData.top + positionData.height) + 'px');
        }
      };
      return service;
    }]).directive('uiGridColumnMenu', ['$timeout', 'gridUtil', 'uiGridConstants', 'uiGridColumnMenuService', '$document', function($timeout, gridUtil, uiGridConstants, uiGridColumnMenuService, $document) {
      var uiGridColumnMenu = {
        priority: 0,
        scope: true,
        require: '^uiGrid',
        templateUrl: 'ui-grid/uiGridColumnMenu',
        replace: true,
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          uiGridColumnMenuService.initialize($scope, uiGridCtrl);
          $scope.defaultMenuItems = uiGridColumnMenuService.getDefaultMenuItems($scope);
          $scope.menuItems = $scope.defaultMenuItems;
          uiGridColumnMenuService.setColMenuItemWatch($scope);
          $scope.showMenu = function(column, $columnElement, event) {
            $scope.col = column;
            var colElementPosition = uiGridColumnMenuService.getColumnElementPosition($scope, column, $columnElement);
            if ($scope.menuShown) {
              $scope.colElement = $columnElement;
              $scope.colElementPosition = colElementPosition;
              $scope.hideThenShow = true;
              $scope.$broadcast('hide-menu', {originalEvent: event});
            } else {
              $scope.menuShown = true;
              uiGridColumnMenuService.repositionMenu($scope, column, colElementPosition, $elm, $columnElement);
              $scope.colElement = $columnElement;
              $scope.colElementPosition = colElementPosition;
              $scope.$broadcast('show-menu', {originalEvent: event});
            }
          };
          $scope.hideMenu = function(broadcastTrigger) {
            $scope.menuShown = false;
            if (!broadcastTrigger) {
              $scope.$broadcast('hide-menu');
            }
          };
          $scope.$on('menu-hidden', function() {
            if ($scope.hideThenShow) {
              delete $scope.hideThenShow;
              uiGridColumnMenuService.repositionMenu($scope, $scope.col, $scope.colElementPosition, $elm, $scope.colElement);
              $scope.$broadcast('show-menu');
              $scope.menuShown = true;
            } else {
              $scope.hideMenu(true);
              if ($scope.col) {
                gridUtil.focus.bySelector($document, '.ui-grid-header-cell.' + $scope.col.getColClass() + ' .ui-grid-column-menu-button', $scope.col.grid, false);
              }
            }
          });
          $scope.$on('menu-shown', function() {
            $timeout(function() {
              uiGridColumnMenuService.repositionMenu($scope, $scope.col, $scope.colElementPosition, $elm, $scope.colElement);
              gridUtil.focus.bySelector($document, '.ui-grid-menu-items .ui-grid-menu-item', true);
              delete $scope.colElementPosition;
              delete $scope.columnElement;
            }, 200);
          });
          $scope.sortColumn = function(event, dir) {
            event.stopPropagation();
            $scope.grid.sortColumn($scope.col, dir, true).then(function() {
              $scope.grid.refresh();
              $scope.hideMenu();
            });
          };
          $scope.unsortColumn = function() {
            $scope.col.unsort();
            $scope.grid.refresh();
            $scope.hideMenu();
          };
          var setFocusOnHideColumn = function() {
            $timeout(function() {
              var focusToGridMenu = function() {
                return gridUtil.focus.byId('grid-menu', $scope.grid);
              };
              var thisIndex;
              $scope.grid.columns.some(function(element, index) {
                if (angular.equals(element, $scope.col)) {
                  thisIndex = index;
                  return true;
                }
              });
              var previousVisibleCol;
              $scope.grid.columns.some(function(element, index) {
                if (!element.visible) {
                  return false;
                } else if (index < thisIndex) {
                  previousVisibleCol = element;
                } else if (index > thisIndex && !previousVisibleCol) {
                  previousVisibleCol = element;
                  return true;
                } else if (index > thisIndex && previousVisibleCol) {
                  return true;
                }
              });
              if (previousVisibleCol) {
                var colClass = previousVisibleCol.getColClass();
                gridUtil.focus.bySelector($document, '.ui-grid-header-cell.' + colClass + ' .ui-grid-header-cell-primary-focus', true).then(angular.noop, function(reason) {
                  if (reason !== 'canceled') {
                    return focusToGridMenu();
                  }
                });
              } else {
                focusToGridMenu();
              }
            });
          };
          $scope.hideColumn = function() {
            $scope.col.colDef.visible = false;
            $scope.col.visible = false;
            $scope.grid.queueGridRefresh();
            $scope.hideMenu();
            $scope.grid.api.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
            $scope.grid.api.core.raise.columnVisibilityChanged($scope.col);
            setFocusOnHideColumn();
          };
        },
        controller: ['$scope', function($scope) {
          var self = this;
          $scope.$watch('menuItems', function(n) {
            self.menuItems = n;
          });
        }]
      };
      return uiGridColumnMenu;
    }]);
  })();
  (function() {
    'use strict';
    angular.module('ui.grid').directive('uiGridFilter', ['$compile', '$templateCache', 'i18nService', 'gridUtil', function($compile, $templateCache, i18nService, gridUtil) {
      return {compile: function() {
          return {
            pre: function($scope, $elm, $attrs, controllers) {
              $scope.col.updateFilters = function(filterable) {
                $elm.children().remove();
                if (filterable) {
                  var template = $scope.col.filterHeaderTemplate;
                  $elm.append($compile(template)($scope));
                }
              };
              $scope.$on('$destroy', function() {
                delete $scope.col.updateFilters;
              });
            },
            post: function($scope, $elm, $attrs, controllers) {
              $scope.aria = i18nService.getSafeText('headerCell.aria');
              $scope.removeFilter = function(colFilter, index) {
                colFilter.term = null;
                gridUtil.focus.bySelector($elm, '.ui-grid-filter-input-' + index);
              };
            }
          };
        }};
    }]);
  })();
  (function() {
    'use strict';
    angular.module('ui.grid').directive('uiGridFooterCell', ['$timeout', 'gridUtil', 'uiGridConstants', '$compile', function($timeout, gridUtil, uiGridConstants, $compile) {
      var uiGridFooterCell = {
        priority: 0,
        scope: {
          col: '=',
          row: '=',
          renderIndex: '='
        },
        replace: true,
        require: '^uiGrid',
        compile: function compile(tElement, tAttrs, transclude) {
          return {
            pre: function($scope, $elm, $attrs, uiGridCtrl) {
              var cellFooter = $compile($scope.col.footerCellTemplate)($scope);
              $elm.append(cellFooter);
            },
            post: function($scope, $elm, $attrs, uiGridCtrl) {
              $scope.grid = uiGridCtrl.grid;
              var initColClass = $scope.col.getColClass(false);
              $elm.addClass(initColClass);
              var classAdded;
              var updateClass = function(grid) {
                var contents = $elm;
                if (classAdded) {
                  contents.removeClass(classAdded);
                  classAdded = null;
                }
                if (angular.isFunction($scope.col.footerCellClass)) {
                  classAdded = $scope.col.footerCellClass($scope.grid, $scope.row, $scope.col, $scope.rowRenderIndex, $scope.colRenderIndex);
                } else {
                  classAdded = $scope.col.footerCellClass;
                }
                contents.addClass(classAdded);
              };
              if ($scope.col.footerCellClass) {
                updateClass();
              }
              $scope.col.updateAggregationValue();
              var dataChangeDereg = $scope.grid.registerDataChangeCallback(updateClass, [uiGridConstants.dataChange.COLUMN]);
              $scope.grid.api.core.on.rowsRendered($scope, $scope.col.updateAggregationValue);
              $scope.grid.api.core.on.rowsRendered($scope, updateClass);
              $scope.$on('$destroy', dataChangeDereg);
            }
          };
        }
      };
      return uiGridFooterCell;
    }]);
  })();
  (function() {
    'use strict';
    angular.module('ui.grid').directive('uiGridFooter', ['$templateCache', '$compile', 'uiGridConstants', 'gridUtil', '$timeout', function($templateCache, $compile, uiGridConstants, gridUtil, $timeout) {
      return {
        restrict: 'EA',
        replace: true,
        require: ['^uiGrid', '^uiGridRenderContainer'],
        scope: true,
        compile: function($elm, $attrs) {
          return {
            pre: function($scope, $elm, $attrs, controllers) {
              var uiGridCtrl = controllers[0];
              var containerCtrl = controllers[1];
              $scope.grid = uiGridCtrl.grid;
              $scope.colContainer = containerCtrl.colContainer;
              containerCtrl.footer = $elm;
              var footerTemplate = $scope.grid.options.footerTemplate;
              gridUtil.getTemplate(footerTemplate).then(function(contents) {
                var template = angular.element(contents);
                var newElm = $compile(template)($scope);
                $elm.append(newElm);
                if (containerCtrl) {
                  var footerViewport = $elm[0].getElementsByClassName('ui-grid-footer-viewport')[0];
                  if (footerViewport) {
                    containerCtrl.footerViewport = footerViewport;
                  }
                }
              });
            },
            post: function($scope, $elm, $attrs, controllers) {
              var uiGridCtrl = controllers[0];
              var containerCtrl = controllers[1];
              var grid = uiGridCtrl.grid;
              gridUtil.disableAnimations($elm);
              containerCtrl.footer = $elm;
              var footerViewport = $elm[0].getElementsByClassName('ui-grid-footer-viewport')[0];
              if (footerViewport) {
                containerCtrl.footerViewport = footerViewport;
              }
            }
          };
        }
      };
    }]);
  })();
  (function() {
    'use strict';
    angular.module('ui.grid').directive('uiGridGridFooter', ['$templateCache', '$compile', 'uiGridConstants', 'gridUtil', '$timeout', function($templateCache, $compile, uiGridConstants, gridUtil, $timeout) {
      return {
        restrict: 'EA',
        replace: true,
        require: '^uiGrid',
        scope: true,
        compile: function($elm, $attrs) {
          return {
            pre: function($scope, $elm, $attrs, uiGridCtrl) {
              $scope.grid = uiGridCtrl.grid;
              var footerTemplate = $scope.grid.options.gridFooterTemplate;
              gridUtil.getTemplate(footerTemplate).then(function(contents) {
                var template = angular.element(contents);
                var newElm = $compile(template)($scope);
                $elm.append(newElm);
              });
            },
            post: function($scope, $elm, $attrs, controllers) {}
          };
        }
      };
    }]);
  })();
  (function() {
    'use strict';
    angular.module('ui.grid').directive('uiGridGroupPanel', ["$compile", "uiGridConstants", "gridUtil", function($compile, uiGridConstants, gridUtil) {
      var defaultTemplate = 'ui-grid/ui-grid-group-panel';
      return {
        restrict: 'EA',
        replace: true,
        require: '?^uiGrid',
        scope: false,
        compile: function($elm, $attrs) {
          return {
            pre: function($scope, $elm, $attrs, uiGridCtrl) {
              var groupPanelTemplate = $scope.grid.options.groupPanelTemplate || defaultTemplate;
              gridUtil.getTemplate(groupPanelTemplate).then(function(contents) {
                var template = angular.element(contents);
                var newElm = $compile(template)($scope);
                $elm.append(newElm);
              });
            },
            post: function($scope, $elm, $attrs, uiGridCtrl) {
              $elm.bind('$destroy', function() {});
            }
          };
        }
      };
    }]);
  })();
  (function() {
    'use strict';
    angular.module('ui.grid').directive('uiGridHeaderCell', ['$compile', '$timeout', '$window', '$document', 'gridUtil', 'uiGridConstants', 'ScrollEvent', 'i18nService', function($compile, $timeout, $window, $document, gridUtil, uiGridConstants, ScrollEvent, i18nService) {
      var mousedownTimeout = 500;
      var changeModeTimeout = 500;
      var uiGridHeaderCell = {
        priority: 0,
        scope: {
          col: '=',
          row: '=',
          renderIndex: '='
        },
        require: ['^uiGrid', '^uiGridRenderContainer'],
        replace: true,
        compile: function() {
          return {
            pre: function($scope, $elm, $attrs) {
              var cellHeader = $compile($scope.col.headerCellTemplate)($scope);
              $elm.append(cellHeader);
            },
            post: function($scope, $elm, $attrs, controllers) {
              var uiGridCtrl = controllers[0];
              var renderContainerCtrl = controllers[1];
              $scope.i18n = {
                headerCell: i18nService.getSafeText('headerCell'),
                sort: i18nService.getSafeText('sort')
              };
              $scope.isSortPriorityVisible = function() {
                return angular.isNumber($scope.col.sort.priority) && $scope.grid.columns.some(function(element, index) {
                  return angular.isNumber(element.sort.priority) && element !== $scope.col;
                });
              };
              $scope.getSortDirectionAriaLabel = function() {
                var col = $scope.col;
                var sortDirectionText = col.sort.direction === uiGridConstants.ASC ? $scope.i18n.sort.ascending : (col.sort.direction === uiGridConstants.DESC ? $scope.i18n.sort.descending : $scope.i18n.sort.none);
                var label = sortDirectionText;
                if ($scope.isSortPriorityVisible()) {
                  label = label + '. ' + $scope.i18n.headerCell.priority + ' ' + col.sort.priority;
                }
                return label;
              };
              $scope.grid = uiGridCtrl.grid;
              $scope.renderContainer = uiGridCtrl.grid.renderContainers[renderContainerCtrl.containerId];
              var initColClass = $scope.col.getColClass(false);
              $elm.addClass(initColClass);
              $scope.menuShown = false;
              $scope.asc = uiGridConstants.ASC;
              $scope.desc = uiGridConstants.DESC;
              var $colMenu = angular.element($elm[0].querySelectorAll('.ui-grid-header-cell-menu'));
              var $contentsElm = angular.element($elm[0].querySelectorAll('.ui-grid-cell-contents'));
              var classAdded;
              var previousMouseX;
              var filterDeregisters = [];
              $scope.downFn = function(event) {
                event.stopPropagation();
                if (typeof(event.originalEvent) !== 'undefined' && event.originalEvent !== undefined) {
                  event = event.originalEvent;
                }
                if (event.button && event.button !== 0) {
                  return;
                }
                previousMouseX = event.pageX;
                $scope.mousedownStartTime = (new Date()).getTime();
                $scope.mousedownTimeout = $timeout(function() {}, mousedownTimeout);
                $scope.mousedownTimeout.then(function() {
                  if ($scope.colMenu) {
                    uiGridCtrl.columnMenuScope.showMenu($scope.col, $elm, event);
                  }
                });
                uiGridCtrl.fireEvent(uiGridConstants.events.COLUMN_HEADER_CLICK, {
                  event: event,
                  columnName: $scope.col.colDef.name
                });
                $scope.offAllEvents();
                if (event.type === 'touchstart') {
                  $document.on('touchend', $scope.upFn);
                  $document.on('touchmove', $scope.moveFn);
                } else if (event.type === 'mousedown') {
                  $document.on('mouseup', $scope.upFn);
                  $document.on('mousemove', $scope.moveFn);
                }
              };
              $scope.upFn = function(event) {
                event.stopPropagation();
                $timeout.cancel($scope.mousedownTimeout);
                $scope.offAllEvents();
                $scope.onDownEvents(event.type);
                var mousedownEndTime = (new Date()).getTime();
                var mousedownTime = mousedownEndTime - $scope.mousedownStartTime;
                if (mousedownTime > mousedownTimeout) {} else {
                  if ($scope.sortable) {
                    $scope.handleClick(event);
                  }
                }
              };
              $scope.moveFn = function(event) {
                var changeValue = event.pageX - previousMouseX;
                if (changeValue === 0) {
                  return;
                }
                $timeout.cancel($scope.mousedownTimeout);
                $scope.offAllEvents();
                $scope.onDownEvents(event.type);
              };
              $scope.clickFn = function(event) {
                event.stopPropagation();
                $contentsElm.off('click', $scope.clickFn);
              };
              $scope.offAllEvents = function() {
                $contentsElm.off('touchstart', $scope.downFn);
                $contentsElm.off('mousedown', $scope.downFn);
                $document.off('touchend', $scope.upFn);
                $document.off('mouseup', $scope.upFn);
                $document.off('touchmove', $scope.moveFn);
                $document.off('mousemove', $scope.moveFn);
                $contentsElm.off('click', $scope.clickFn);
              };
              $scope.onDownEvents = function(type) {
                switch (type) {
                  case 'touchmove':
                  case 'touchend':
                    $contentsElm.on('click', $scope.clickFn);
                    $contentsElm.on('touchstart', $scope.downFn);
                    $timeout(function() {
                      $contentsElm.on('mousedown', $scope.downFn);
                    }, changeModeTimeout);
                    break;
                  case 'mousemove':
                  case 'mouseup':
                    $contentsElm.on('click', $scope.clickFn);
                    $contentsElm.on('mousedown', $scope.downFn);
                    $timeout(function() {
                      $contentsElm.on('touchstart', $scope.downFn);
                    }, changeModeTimeout);
                    break;
                  default:
                    $contentsElm.on('click', $scope.clickFn);
                    $contentsElm.on('touchstart', $scope.downFn);
                    $contentsElm.on('mousedown', $scope.downFn);
                }
              };
              var updateHeaderOptions = function(grid) {
                var contents = $elm;
                if (classAdded) {
                  contents.removeClass(classAdded);
                  classAdded = null;
                }
                if (angular.isFunction($scope.col.headerCellClass)) {
                  classAdded = $scope.col.headerCellClass($scope.grid, $scope.row, $scope.col, $scope.rowRenderIndex, $scope.colRenderIndex);
                } else {
                  classAdded = $scope.col.headerCellClass;
                }
                contents.addClass(classAdded);
                $timeout(function() {
                  var rightMostContainer = $scope.grid.renderContainers['right'] ? $scope.grid.renderContainers['right'] : $scope.grid.renderContainers['body'];
                  $scope.isLastCol = ($scope.col === rightMostContainer.visibleColumnCache[rightMostContainer.visibleColumnCache.length - 1]);
                });
                if (uiGridCtrl.grid.options.enableSorting && $scope.col.enableSorting) {
                  $scope.sortable = true;
                } else {
                  $scope.sortable = false;
                }
                var oldFilterable = $scope.filterable;
                if (uiGridCtrl.grid.options.enableFiltering && $scope.col.enableFiltering) {
                  $scope.filterable = true;
                } else {
                  $scope.filterable = false;
                }
                if (oldFilterable !== $scope.filterable) {
                  if (typeof($scope.col.updateFilters) !== 'undefined') {
                    $scope.col.updateFilters($scope.filterable);
                  }
                  if ($scope.filterable) {
                    $scope.col.filters.forEach(function(filter, i) {
                      filterDeregisters.push($scope.$watch('col.filters[' + i + '].term', function(n, o) {
                        if (n !== o) {
                          uiGridCtrl.grid.api.core.raise.filterChanged();
                          uiGridCtrl.grid.api.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
                          uiGridCtrl.grid.queueGridRefresh();
                        }
                      }));
                    });
                    $scope.$on('$destroy', function() {
                      filterDeregisters.forEach(function(filterDeregister) {
                        filterDeregister();
                      });
                    });
                  } else {
                    filterDeregisters.forEach(function(filterDeregister) {
                      filterDeregister();
                    });
                  }
                }
                if ($scope.col.grid.options && $scope.col.grid.options.enableColumnMenus !== false && $scope.col.colDef && $scope.col.colDef.enableColumnMenu !== false) {
                  $scope.colMenu = true;
                } else {
                  $scope.colMenu = false;
                }
                $scope.offAllEvents();
                if ($scope.sortable || $scope.colMenu) {
                  $scope.onDownEvents();
                  $scope.$on('$destroy', function() {
                    $scope.offAllEvents();
                  });
                }
              };
              updateHeaderOptions();
              var dataChangeDereg = $scope.grid.registerDataChangeCallback(updateHeaderOptions, [uiGridConstants.dataChange.COLUMN]);
              $scope.$on('$destroy', dataChangeDereg);
              $scope.handleClick = function(event) {
                var add = false;
                if (event.shiftKey) {
                  add = true;
                }
                uiGridCtrl.grid.sortColumn($scope.col, add).then(function() {
                  if (uiGridCtrl.columnMenuScope) {
                    uiGridCtrl.columnMenuScope.hideMenu();
                  }
                  uiGridCtrl.grid.refresh();
                });
              };
              $scope.toggleMenu = function(event) {
                event.stopPropagation();
                if (uiGridCtrl.columnMenuScope.menuShown) {
                  if (uiGridCtrl.columnMenuScope.col === $scope.col) {
                    uiGridCtrl.columnMenuScope.hideMenu();
                  } else {
                    uiGridCtrl.columnMenuScope.showMenu($scope.col, $elm);
                  }
                } else {
                  uiGridCtrl.columnMenuScope.showMenu($scope.col, $elm);
                }
              };
            }
          };
        }
      };
      return uiGridHeaderCell;
    }]);
  })();
  (function() {
    'use strict';
    angular.module('ui.grid').directive('uiGridHeader', ['$templateCache', '$compile', 'uiGridConstants', 'gridUtil', '$timeout', 'ScrollEvent', function($templateCache, $compile, uiGridConstants, gridUtil, $timeout, ScrollEvent) {
      var defaultTemplate = 'ui-grid/ui-grid-header';
      var emptyTemplate = 'ui-grid/ui-grid-no-header';
      return {
        restrict: 'EA',
        replace: true,
        require: ['^uiGrid', '^uiGridRenderContainer'],
        scope: true,
        compile: function($elm, $attrs) {
          return {
            pre: function($scope, $elm, $attrs, controllers) {
              var uiGridCtrl = controllers[0];
              var containerCtrl = controllers[1];
              $scope.grid = uiGridCtrl.grid;
              $scope.colContainer = containerCtrl.colContainer;
              updateHeaderReferences();
              var headerTemplate;
              if (!$scope.grid.options.showHeader) {
                headerTemplate = emptyTemplate;
              } else {
                headerTemplate = ($scope.grid.options.headerTemplate) ? $scope.grid.options.headerTemplate : defaultTemplate;
              }
              gridUtil.getTemplate(headerTemplate).then(function(contents) {
                var template = angular.element(contents);
                var newElm = $compile(template)($scope);
                $elm.replaceWith(newElm);
                $elm = newElm;
                updateHeaderReferences();
                if (containerCtrl) {
                  var headerViewport = $elm[0].getElementsByClassName('ui-grid-header-viewport')[0];
                  if (headerViewport) {
                    containerCtrl.headerViewport = headerViewport;
                    angular.element(headerViewport).on('scroll', scrollHandler);
                    $scope.$on('$destroy', function() {
                      angular.element(headerViewport).off('scroll', scrollHandler);
                    });
                  }
                }
                $scope.grid.queueRefresh();
              });
              function updateHeaderReferences() {
                containerCtrl.header = containerCtrl.colContainer.header = $elm;
                var headerCanvases = $elm[0].getElementsByClassName('ui-grid-header-canvas');
                if (headerCanvases.length > 0) {
                  containerCtrl.headerCanvas = containerCtrl.colContainer.headerCanvas = headerCanvases[0];
                } else {
                  containerCtrl.headerCanvas = null;
                }
              }
              function scrollHandler(evt) {
                if (uiGridCtrl.grid.isScrollingHorizontally) {
                  return;
                }
                var newScrollLeft = gridUtil.normalizeScrollLeft(containerCtrl.headerViewport, uiGridCtrl.grid);
                var horizScrollPercentage = containerCtrl.colContainer.scrollHorizontal(newScrollLeft);
                var scrollEvent = new ScrollEvent(uiGridCtrl.grid, null, containerCtrl.colContainer, ScrollEvent.Sources.ViewPortScroll);
                scrollEvent.newScrollLeft = newScrollLeft;
                if (horizScrollPercentage > -1) {
                  scrollEvent.x = {percentage: horizScrollPercentage};
                }
                uiGridCtrl.grid.scrollContainers(null, scrollEvent);
              }
            },
            post: function($scope, $elm, $attrs, controllers) {
              var uiGridCtrl = controllers[0];
              var containerCtrl = controllers[1];
              var grid = uiGridCtrl.grid;
              gridUtil.disableAnimations($elm);
              function updateColumnWidths() {
                var columnCache = containerCtrl.colContainer.visibleColumnCache;
                var ret = '';
                var canvasWidth = 0;
                columnCache.forEach(function(column) {
                  ret = ret + column.getColClassDefinition();
                  canvasWidth += column.drawnWidth;
                });
                containerCtrl.colContainer.canvasWidth = canvasWidth;
                return ret;
              }
              containerCtrl.header = $elm;
              var headerViewport = $elm[0].getElementsByClassName('ui-grid-header-viewport')[0];
              if (headerViewport) {
                containerCtrl.headerViewport = headerViewport;
              }
              if (uiGridCtrl) {
                uiGridCtrl.grid.registerStyleComputation({
                  priority: 15,
                  func: updateColumnWidths
                });
              }
            }
          };
        }
      };
    }]);
  })();
  (function() {
    angular.module('ui.grid').service('uiGridGridMenuService', ['gridUtil', 'i18nService', 'uiGridConstants', function(gridUtil, i18nService, uiGridConstants) {
      var service = {
        initialize: function($scope, grid) {
          grid.gridMenuScope = $scope;
          $scope.grid = grid;
          $scope.registeredMenuItems = [];
          $scope.$on('$destroy', function() {
            if ($scope.grid && $scope.grid.gridMenuScope) {
              $scope.grid.gridMenuScope = null;
            }
            if ($scope.grid) {
              $scope.grid = null;
            }
            if ($scope.registeredMenuItems) {
              $scope.registeredMenuItems = null;
            }
          });
          $scope.registeredMenuItems = [];
          grid.api.registerMethod('core', 'addToGridMenu', service.addToGridMenu);
          grid.api.registerMethod('core', 'removeFromGridMenu', service.removeFromGridMenu);
        },
        addToGridMenu: function(grid, menuItems) {
          if (!angular.isArray(menuItems)) {
            gridUtil.logError('addToGridMenu: menuItems must be an array, and is not, not adding any items');
          } else {
            if (grid.gridMenuScope) {
              grid.gridMenuScope.registeredMenuItems = grid.gridMenuScope.registeredMenuItems ? grid.gridMenuScope.registeredMenuItems : [];
              grid.gridMenuScope.registeredMenuItems = grid.gridMenuScope.registeredMenuItems.concat(menuItems);
            } else {
              gridUtil.logError('Asked to addToGridMenu, but gridMenuScope not present.  Timing issue?  Please log issue with ui-grid');
            }
          }
        },
        removeFromGridMenu: function(grid, id) {
          var foundIndex = -1;
          if (grid && grid.gridMenuScope) {
            grid.gridMenuScope.registeredMenuItems.forEach(function(value, index) {
              if (value.id === id) {
                if (foundIndex > -1) {
                  gridUtil.logError('removeFromGridMenu: found multiple items with the same id, removing only the last');
                } else {
                  foundIndex = index;
                }
              }
            });
          }
          if (foundIndex > -1) {
            grid.gridMenuScope.registeredMenuItems.splice(foundIndex, 1);
          }
        },
        getMenuItems: function($scope) {
          var menuItems = [];
          if ($scope.grid.options.gridMenuCustomItems) {
            if (!angular.isArray($scope.grid.options.gridMenuCustomItems)) {
              gridUtil.logError('gridOptions.gridMenuCustomItems must be an array, and is not');
            } else {
              menuItems = menuItems.concat($scope.grid.options.gridMenuCustomItems);
            }
          }
          var clearFilters = [{
            title: i18nService.getSafeText('gridMenu.clearAllFilters'),
            action: function($event) {
              $scope.grid.clearAllFilters(undefined, true, undefined);
            },
            shown: function() {
              return $scope.grid.options.enableFiltering;
            },
            order: 100
          }];
          menuItems = menuItems.concat(clearFilters);
          menuItems = menuItems.concat($scope.registeredMenuItems);
          if ($scope.grid.options.gridMenuShowHideColumns !== false) {
            menuItems = menuItems.concat(service.showHideColumns($scope));
          }
          menuItems.sort(function(a, b) {
            return a.order - b.order;
          });
          return menuItems;
        },
        showHideColumns: function($scope) {
          var showHideColumns = [];
          if (!$scope.grid.options.columnDefs || $scope.grid.options.columnDefs.length === 0 || $scope.grid.columns.length === 0) {
            return showHideColumns;
          }
          showHideColumns.push({
            title: i18nService.getSafeText('gridMenu.columns'),
            order: 300
          });
          $scope.grid.options.gridMenuTitleFilter = $scope.grid.options.gridMenuTitleFilter ? $scope.grid.options.gridMenuTitleFilter : function(title) {
            return title;
          };
          $scope.grid.options.columnDefs.forEach(function(colDef, index) {
            if (colDef.enableHiding !== false) {
              var menuItem = {
                icon: 'ui-grid-icon-ok',
                action: function($event) {
                  $event.stopPropagation();
                  service.toggleColumnVisibility(this.context.gridCol);
                },
                shown: function() {
                  return this.context.gridCol.colDef.visible === true || this.context.gridCol.colDef.visible === undefined;
                },
                context: {gridCol: $scope.grid.getColumn(colDef.name || colDef.field)},
                leaveOpen: true,
                order: 301 + index * 2
              };
              service.setMenuItemTitle(menuItem, colDef, $scope.grid);
              showHideColumns.push(menuItem);
              menuItem = {
                icon: 'ui-grid-icon-cancel',
                action: function($event) {
                  $event.stopPropagation();
                  service.toggleColumnVisibility(this.context.gridCol);
                },
                shown: function() {
                  return !(this.context.gridCol.colDef.visible === true || this.context.gridCol.colDef.visible === undefined);
                },
                context: {gridCol: $scope.grid.getColumn(colDef.name || colDef.field)},
                leaveOpen: true,
                order: 301 + index * 2 + 1
              };
              service.setMenuItemTitle(menuItem, colDef, $scope.grid);
              showHideColumns.push(menuItem);
            }
          });
          return showHideColumns;
        },
        setMenuItemTitle: function(menuItem, colDef, grid) {
          var title = grid.options.gridMenuTitleFilter(colDef.displayName || gridUtil.readableColumnName(colDef.name) || colDef.field);
          if (typeof(title) === 'string') {
            menuItem.title = title;
          } else if (title.then) {
            menuItem.title = "";
            title.then(function(successValue) {
              menuItem.title = successValue;
            }, function(errorValue) {
              menuItem.title = errorValue;
            });
          } else {
            gridUtil.logError('Expected gridMenuTitleFilter to return a string or a promise, it has returned neither, bad config');
            menuItem.title = 'badconfig';
          }
        },
        toggleColumnVisibility: function(gridCol) {
          gridCol.colDef.visible = !(gridCol.colDef.visible === true || gridCol.colDef.visible === undefined);
          gridCol.grid.refresh();
          gridCol.grid.api.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
          gridCol.grid.api.core.raise.columnVisibilityChanged(gridCol);
        }
      };
      return service;
    }]).directive('uiGridMenuButton', ['gridUtil', 'uiGridConstants', 'uiGridGridMenuService', 'i18nService', function(gridUtil, uiGridConstants, uiGridGridMenuService, i18nService) {
      return {
        priority: 0,
        scope: true,
        require: ['^uiGrid'],
        templateUrl: 'ui-grid/ui-grid-menu-button',
        replace: true,
        link: function($scope, $elm, $attrs, controllers) {
          var uiGridCtrl = controllers[0];
          $scope.i18n = {aria: i18nService.getSafeText('gridMenu.aria')};
          uiGridGridMenuService.initialize($scope, uiGridCtrl.grid);
          $scope.shown = false;
          $scope.toggleMenu = function() {
            if ($scope.shown) {
              $scope.$broadcast('hide-menu');
              $scope.shown = false;
            } else {
              $scope.menuItems = uiGridGridMenuService.getMenuItems($scope);
              $scope.$broadcast('show-menu');
              $scope.shown = true;
            }
          };
          $scope.$on('menu-hidden', function() {
            $scope.shown = false;
            gridUtil.focus.bySelector($elm, '.ui-grid-icon-container');
          });
        }
      };
    }]);
  })();
  (function() {
    angular.module('ui.grid').directive('uiGridMenu', ['$compile', '$timeout', '$window', '$document', 'gridUtil', 'uiGridConstants', 'i18nService', function($compile, $timeout, $window, $document, gridUtil, uiGridConstants, i18nService) {
      var uiGridMenu = {
        priority: 0,
        scope: {
          menuItems: '=',
          autoHide: '=?'
        },
        require: '?^uiGrid',
        templateUrl: 'ui-grid/uiGridMenu',
        replace: false,
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          var gridMenuMaxHeight;
          $scope.dynamicStyles = '';
          if (uiGridCtrl) {
            gridMenuMaxHeight = uiGridCtrl.grid.gridHeight - 30;
            $scope.dynamicStyles = ['.grid' + uiGridCtrl.grid.id + ' .ui-grid-menu-mid {', 'max-height: ' + gridMenuMaxHeight + 'px;', '}'].join(' ');
          }
          $scope.i18n = {close: i18nService.getSafeText('columnMenu.close')};
          $scope.showMenu = function(event, args) {
            if (!$scope.shown) {
              $scope.shown = true;
              $timeout(function() {
                $scope.shownMid = true;
                $scope.$emit('menu-shown');
              });
            } else if (!$scope.shownMid) {
              $scope.shownMid = true;
              $scope.$emit('menu-shown');
            }
            var docEventType = 'click';
            if (args && args.originalEvent && args.originalEvent.type && args.originalEvent.type === 'touchstart') {
              docEventType = args.originalEvent.type;
            }
            angular.element(document).off('click touchstart', applyHideMenu);
            $elm.off('keyup', checkKeyUp);
            $elm.off('keydown', checkKeyDown);
            $timeout(function() {
              angular.element(document).on(docEventType, applyHideMenu);
              $elm.on('keyup', checkKeyUp);
              $elm.on('keydown', checkKeyDown);
            });
            gridUtil.focus.bySelector($elm, 'button[type=button]', true);
          };
          $scope.hideMenu = function(event) {
            if ($scope.shown) {
              $scope.shownMid = false;
              $timeout(function() {
                if (!$scope.shownMid) {
                  $scope.shown = false;
                  $scope.$emit('menu-hidden');
                }
              }, 200);
            }
            angular.element(document).off('click touchstart', applyHideMenu);
            $elm.off('keyup', checkKeyUp);
            $elm.off('keydown', checkKeyDown);
          };
          $scope.$on('hide-menu', function(event, args) {
            $scope.hideMenu(event, args);
          });
          $scope.$on('show-menu', function(event, args) {
            $scope.showMenu(event, args);
          });
          var applyHideMenu = function() {
            if ($scope.shown) {
              $scope.$apply(function() {
                $scope.hideMenu();
              });
            }
          };
          var checkKeyUp = function(event) {
            if (event.keyCode === 27) {
              $scope.hideMenu();
            }
          };
          var checkKeyDown = function(event) {
            var setFocus = function(elm) {
              elm.focus();
              event.preventDefault();
              return false;
            };
            if (event.keyCode === 9) {
              var firstMenuItem,
                  lastMenuItem;
              var menuItemButtons = $elm[0].querySelectorAll('button:not(.ng-hide)');
              if (menuItemButtons.length > 0) {
                firstMenuItem = menuItemButtons[0];
                lastMenuItem = menuItemButtons[menuItemButtons.length - 1];
                if (event.target === lastMenuItem && !event.shiftKey) {
                  setFocus(firstMenuItem);
                } else if (event.target === firstMenuItem && event.shiftKey) {
                  setFocus(lastMenuItem);
                }
              }
            }
          };
          if (typeof($scope.autoHide) === 'undefined' || $scope.autoHide === undefined) {
            $scope.autoHide = true;
          }
          if ($scope.autoHide) {
            angular.element($window).on('resize', applyHideMenu);
          }
          $scope.$on('$destroy', function() {
            angular.element(document).off('click touchstart', applyHideMenu);
          });
          $scope.$on('$destroy', function() {
            angular.element($window).off('resize', applyHideMenu);
          });
          if (uiGridCtrl) {
            $scope.$on('$destroy', uiGridCtrl.grid.api.core.on.scrollBegin($scope, applyHideMenu));
          }
          $scope.$on('$destroy', $scope.$on(uiGridConstants.events.ITEM_DRAGGING, applyHideMenu));
        }
      };
      return uiGridMenu;
    }]).directive('uiGridMenuItem', ['gridUtil', '$compile', 'i18nService', function(gridUtil, $compile, i18nService) {
      var uiGridMenuItem = {
        priority: 0,
        scope: {
          name: '=',
          active: '=',
          action: '=',
          icon: '=',
          shown: '=',
          context: '=',
          templateUrl: '=',
          leaveOpen: '=',
          screenReaderOnly: '='
        },
        require: ['?^uiGrid'],
        templateUrl: 'ui-grid/uiGridMenuItem',
        replace: false,
        compile: function() {
          return {
            pre: function($scope, $elm) {
              if ($scope.templateUrl) {
                gridUtil.getTemplate($scope.templateUrl).then(function(contents) {
                  var template = angular.element(contents);
                  var newElm = $compile(template)($scope);
                  $elm.replaceWith(newElm);
                });
              }
            },
            post: function($scope, $elm, $attrs, controllers) {
              var uiGridCtrl = controllers[0];
              if (typeof($scope.shown) === 'undefined' || $scope.shown === null) {
                $scope.shown = function() {
                  return true;
                };
              }
              $scope.itemShown = function() {
                var context = {};
                if ($scope.context) {
                  context.context = $scope.context;
                }
                if (typeof(uiGridCtrl) !== 'undefined' && uiGridCtrl) {
                  context.grid = uiGridCtrl.grid;
                }
                return $scope.shown.call(context);
              };
              $scope.itemAction = function($event, title) {
                gridUtil.logDebug('itemAction');
                $event.stopPropagation();
                if (typeof($scope.action) === 'function') {
                  var context = {};
                  if ($scope.context) {
                    context.context = $scope.context;
                  }
                  if (typeof(uiGridCtrl) !== 'undefined' && uiGridCtrl) {
                    context.grid = uiGridCtrl.grid;
                  }
                  $scope.action.call(context, $event, title);
                  if (!$scope.leaveOpen) {
                    $scope.$emit('hide-menu');
                  } else {
                    gridUtil.focus.bySelector(angular.element(gridUtil.closestElm($elm, ".ui-grid-menu-items")), 'button[type=button]', true);
                  }
                }
              };
              $scope.i18n = i18nService.get();
            }
          };
        }
      };
      return uiGridMenuItem;
    }]);
  })();
  (function() {
    'use strict';
    var oneBinders = angular.module('ui.grid');
    angular.forEach([{
      tag: 'Src',
      method: 'attr'
    }, {
      tag: 'Text',
      method: 'text'
    }, {
      tag: 'Href',
      method: 'attr'
    }, {
      tag: 'Class',
      method: 'addClass'
    }, {
      tag: 'Html',
      method: 'html'
    }, {
      tag: 'Alt',
      method: 'attr'
    }, {
      tag: 'Style',
      method: 'css'
    }, {
      tag: 'Value',
      method: 'attr'
    }, {
      tag: 'Id',
      method: 'attr'
    }, {
      tag: 'Id',
      directiveName: 'IdGrid',
      method: 'attr',
      appendGridId: true
    }, {
      tag: 'Title',
      method: 'attr'
    }, {
      tag: 'Label',
      method: 'attr',
      aria: true
    }, {
      tag: 'Labelledby',
      method: 'attr',
      aria: true
    }, {
      tag: 'Labelledby',
      directiveName: 'LabelledbyGrid',
      appendGridId: true,
      method: 'attr',
      aria: true
    }, {
      tag: 'Describedby',
      method: 'attr',
      aria: true
    }, {
      tag: 'Describedby',
      directiveName: 'DescribedbyGrid',
      appendGridId: true,
      method: 'attr',
      aria: true
    }], function(v) {
      var baseDirectiveName = 'uiGridOneBind';
      var directiveName = (v.aria ? baseDirectiveName + 'Aria' : baseDirectiveName) + (v.directiveName ? v.directiveName : v.tag);
      oneBinders.directive(directiveName, ['gridUtil', function(gridUtil) {
        return {
          restrict: 'A',
          require: ['?uiGrid', '?^uiGrid'],
          link: function(scope, iElement, iAttrs, controllers) {
            var appendGridId = function(val) {
              var grid;
              if (scope.grid) {
                grid = scope.grid;
              } else if (scope.col && scope.col.grid) {
                grid = scope.col.grid;
              } else if (!controllers.some(function(controller) {
                if (controller && controller.grid) {
                  grid = controller.grid;
                  return true;
                }
              })) {
                gridUtil.logError("[" + directiveName + "] A valid grid could not be found to bind id. Are you using this directive " + "within the correct scope? Trying to generate id: [gridID]-" + val);
                throw new Error("No valid grid could be found");
              }
              if (grid) {
                var idRegex = new RegExp(grid.id.toString());
                if (!idRegex.test(val)) {
                  val = grid.id.toString() + '-' + val;
                }
              }
              return val;
            };
            var rmWatcher = scope.$watch(iAttrs[directiveName], function(newV) {
              if (newV) {
                if (v.appendGridId) {
                  var newIdString = null;
                  angular.forEach(newV.split(' '), function(s) {
                    newIdString = (newIdString ? (newIdString + ' ') : '') + appendGridId(s);
                  });
                  newV = newIdString;
                }
                switch (v.method) {
                  case 'attr':
                    if (v.aria) {
                      iElement[v.method]('aria-' + v.tag.toLowerCase(), newV);
                    } else {
                      iElement[v.method](v.tag.toLowerCase(), newV);
                    }
                    break;
                  case 'addClass':
                    if (angular.isObject(newV) && !angular.isArray(newV)) {
                      var results = [];
                      var nonNullFound = false;
                      angular.forEach(newV, function(value, index) {
                        if (value !== null && typeof(value) !== "undefined") {
                          nonNullFound = true;
                          if (value) {
                            results.push(index);
                          }
                        }
                      });
                      if (!nonNullFound) {
                        return;
                      }
                      newV = results;
                    }
                    if (newV) {
                      iElement.addClass(angular.isArray(newV) ? newV.join(' ') : newV);
                    } else {
                      return;
                    }
                    break;
                  default:
                    iElement[v.method](newV);
                    break;
                }
                rmWatcher();
              }
            }, true);
          }
        };
      }]);
    });
  })();
  (function() {
    'use strict';
    var module = angular.module('ui.grid');
    module.directive('uiGridRenderContainer', ['$timeout', '$document', 'uiGridConstants', 'gridUtil', 'ScrollEvent', function($timeout, $document, uiGridConstants, gridUtil, ScrollEvent) {
      return {
        replace: true,
        transclude: true,
        templateUrl: 'ui-grid/uiGridRenderContainer',
        require: ['^uiGrid', 'uiGridRenderContainer'],
        scope: {
          containerId: '=',
          rowContainerName: '=',
          colContainerName: '=',
          bindScrollHorizontal: '=',
          bindScrollVertical: '=',
          enableVerticalScrollbar: '=',
          enableHorizontalScrollbar: '='
        },
        controller: 'uiGridRenderContainer as RenderContainer',
        compile: function() {
          return {
            pre: function prelink($scope, $elm, $attrs, controllers) {
              var uiGridCtrl = controllers[0];
              var containerCtrl = controllers[1];
              var grid = $scope.grid = uiGridCtrl.grid;
              if (!$scope.rowContainerName) {
                throw "No row render container name specified";
              }
              if (!$scope.colContainerName) {
                throw "No column render container name specified";
              }
              if (!grid.renderContainers[$scope.rowContainerName]) {
                throw "Row render container '" + $scope.rowContainerName + "' is not registered.";
              }
              if (!grid.renderContainers[$scope.colContainerName]) {
                throw "Column render container '" + $scope.colContainerName + "' is not registered.";
              }
              var rowContainer = $scope.rowContainer = grid.renderContainers[$scope.rowContainerName];
              var colContainer = $scope.colContainer = grid.renderContainers[$scope.colContainerName];
              containerCtrl.containerId = $scope.containerId;
              containerCtrl.rowContainer = rowContainer;
              containerCtrl.colContainer = colContainer;
            },
            post: function postlink($scope, $elm, $attrs, controllers) {
              var uiGridCtrl = controllers[0];
              var containerCtrl = controllers[1];
              var grid = uiGridCtrl.grid;
              var rowContainer = containerCtrl.rowContainer;
              var colContainer = containerCtrl.colContainer;
              var scrollTop = null;
              var scrollLeft = null;
              var renderContainer = grid.renderContainers[$scope.containerId];
              $elm.addClass('ui-grid-render-container-' + $scope.containerId);
              gridUtil.on.mousewheel($elm, function(event) {
                var scrollEvent = new ScrollEvent(grid, rowContainer, colContainer, ScrollEvent.Sources.RenderContainerMouseWheel);
                if (event.deltaY !== 0) {
                  var scrollYAmount = event.deltaY * -1 * event.deltaFactor;
                  scrollTop = containerCtrl.viewport[0].scrollTop;
                  scrollEvent.verticalScrollLength = rowContainer.getVerticalScrollLength();
                  var scrollYPercentage = (scrollTop + scrollYAmount) / scrollEvent.verticalScrollLength;
                  if (scrollYPercentage >= 1 && scrollTop < scrollEvent.verticalScrollLength) {
                    containerCtrl.viewport[0].scrollTop = scrollEvent.verticalScrollLength;
                  }
                  if (scrollYPercentage < 0) {
                    scrollYPercentage = 0;
                  } else if (scrollYPercentage > 1) {
                    scrollYPercentage = 1;
                  }
                  scrollEvent.y = {
                    percentage: scrollYPercentage,
                    pixels: scrollYAmount
                  };
                }
                if (event.deltaX !== 0) {
                  var scrollXAmount = event.deltaX * event.deltaFactor;
                  scrollLeft = gridUtil.normalizeScrollLeft(containerCtrl.viewport, grid);
                  scrollEvent.horizontalScrollLength = (colContainer.getCanvasWidth() - colContainer.getViewportWidth());
                  var scrollXPercentage = (scrollLeft + scrollXAmount) / scrollEvent.horizontalScrollLength;
                  if (scrollXPercentage < 0) {
                    scrollXPercentage = 0;
                  } else if (scrollXPercentage > 1) {
                    scrollXPercentage = 1;
                  }
                  scrollEvent.x = {
                    percentage: scrollXPercentage,
                    pixels: scrollXAmount
                  };
                }
                if ((event.deltaY !== 0 && (scrollEvent.atTop(scrollTop) || scrollEvent.atBottom(scrollTop))) || (event.deltaX !== 0 && (scrollEvent.atLeft(scrollLeft) || scrollEvent.atRight(scrollLeft)))) {} else {
                  event.preventDefault();
                  event.stopPropagation();
                  scrollEvent.fireThrottledScrollingEvent('', scrollEvent);
                }
              });
              $elm.bind('$destroy', function() {
                $elm.unbind('keydown');
                ['touchstart', 'touchmove', 'touchend', 'keydown', 'wheel', 'mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'].forEach(function(eventName) {
                  $elm.unbind(eventName);
                });
              });
              function update() {
                var ret = '';
                var canvasWidth = colContainer.canvasWidth;
                var viewportWidth = colContainer.getViewportWidth();
                var canvasHeight = rowContainer.getCanvasHeight();
                var viewportHeight = rowContainer.getViewportHeight();
                if (colContainer.needsHScrollbarPlaceholder()) {
                  viewportHeight -= grid.scrollbarHeight;
                }
                var headerViewportWidth,
                    footerViewportWidth;
                headerViewportWidth = footerViewportWidth = colContainer.getHeaderViewportWidth();
                ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId + ' .ui-grid-canvas { width: ' + canvasWidth + 'px; height: ' + canvasHeight + 'px; }';
                ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId + ' .ui-grid-header-canvas { width: ' + (canvasWidth + grid.scrollbarWidth) + 'px; }';
                if (renderContainer.explicitHeaderCanvasHeight) {
                  ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId + ' .ui-grid-header-canvas { height: ' + renderContainer.explicitHeaderCanvasHeight + 'px; }';
                } else {
                  ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId + ' .ui-grid-header-canvas { height: inherit; }';
                }
                ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId + ' .ui-grid-viewport { width: ' + viewportWidth + 'px; height: ' + viewportHeight + 'px; }';
                ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId + ' .ui-grid-header-viewport { width: ' + headerViewportWidth + 'px; }';
                ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId + ' .ui-grid-footer-canvas { width: ' + (canvasWidth + grid.scrollbarWidth) + 'px; }';
                ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId + ' .ui-grid-footer-viewport { width: ' + footerViewportWidth + 'px; }';
                return ret;
              }
              uiGridCtrl.grid.registerStyleComputation({
                priority: 6,
                func: update
              });
            }
          };
        }
      };
    }]);
    module.controller('uiGridRenderContainer', ['$scope', 'gridUtil', function($scope, gridUtil) {}]);
  })();
  (function() {
    'use strict';
    angular.module('ui.grid').directive('uiGridRow', ['gridUtil', function(gridUtil) {
      return {
        replace: true,
        require: ['^uiGrid', '^uiGridRenderContainer'],
        scope: {
          row: '=uiGridRow',
          rowRenderIndex: '='
        },
        compile: function() {
          return {
            pre: function($scope, $elm, $attrs, controllers) {
              var uiGridCtrl = controllers[0];
              var containerCtrl = controllers[1];
              var grid = uiGridCtrl.grid;
              $scope.grid = uiGridCtrl.grid;
              $scope.colContainer = containerCtrl.colContainer;
              var clonedElement,
                  cloneScope;
              function compileTemplate() {
                $scope.row.getRowTemplateFn.then(function(compiledElementFn) {
                  var newScope = $scope.$new();
                  compiledElementFn(newScope, function(newElm, scope) {
                    if (clonedElement) {
                      clonedElement.remove();
                      cloneScope.$destroy();
                    }
                    $elm.empty().append(newElm);
                    clonedElement = newElm;
                    cloneScope = newScope;
                  });
                });
              }
              compileTemplate();
              $scope.$watch('row.getRowTemplateFn', function(newFunc, oldFunc) {
                if (newFunc !== oldFunc) {
                  compileTemplate();
                }
              });
            },
            post: function($scope, $elm, $attrs, controllers) {}
          };
        }
      };
    }]);
  })();
  (function() {
    angular.module('ui.grid').directive('uiGridStyle', ['gridUtil', '$interpolate', function(gridUtil, $interpolate) {
      return {link: function($scope, $elm, $attrs, uiGridCtrl) {
          var interpolateFn = $interpolate($elm.text(), true);
          if (interpolateFn) {
            $scope.$watch(interpolateFn, function(value) {
              $elm.text(value);
            });
          }
        }};
    }]);
  })();
  (function() {
    'use strict';
    angular.module('ui.grid').directive('uiGridViewport', ['gridUtil', 'ScrollEvent', 'uiGridConstants', '$log', function(gridUtil, ScrollEvent, uiGridConstants, $log) {
      return {
        replace: true,
        scope: {},
        controllerAs: 'Viewport',
        templateUrl: 'ui-grid/uiGridViewport',
        require: ['^uiGrid', '^uiGridRenderContainer'],
        link: function($scope, $elm, $attrs, controllers) {
          var uiGridCtrl = controllers[0];
          var containerCtrl = controllers[1];
          $scope.containerCtrl = containerCtrl;
          var rowContainer = containerCtrl.rowContainer;
          var colContainer = containerCtrl.colContainer;
          var grid = uiGridCtrl.grid;
          $scope.grid = uiGridCtrl.grid;
          $scope.rowContainer = containerCtrl.rowContainer;
          $scope.colContainer = containerCtrl.colContainer;
          containerCtrl.viewport = $elm;
          $elm.on('scroll', scrollHandler);
          var ignoreScroll = false;
          function scrollHandler(evt) {
            var newScrollTop = $elm[0].scrollTop;
            var newScrollLeft = gridUtil.normalizeScrollLeft($elm, grid);
            var vertScrollPercentage = rowContainer.scrollVertical(newScrollTop);
            var horizScrollPercentage = colContainer.scrollHorizontal(newScrollLeft);
            var scrollEvent = new ScrollEvent(grid, rowContainer, colContainer, ScrollEvent.Sources.ViewPortScroll);
            scrollEvent.newScrollLeft = newScrollLeft;
            scrollEvent.newScrollTop = newScrollTop;
            if (horizScrollPercentage > -1) {
              scrollEvent.x = {percentage: horizScrollPercentage};
            }
            if (vertScrollPercentage > -1) {
              scrollEvent.y = {percentage: vertScrollPercentage};
            }
            grid.scrollContainers($scope.$parent.containerId, scrollEvent);
          }
          if ($scope.$parent.bindScrollVertical) {
            grid.addVerticalScrollSync($scope.$parent.containerId, syncVerticalScroll);
          }
          if ($scope.$parent.bindScrollHorizontal) {
            grid.addHorizontalScrollSync($scope.$parent.containerId, syncHorizontalScroll);
            grid.addHorizontalScrollSync($scope.$parent.containerId + 'header', syncHorizontalHeader);
            grid.addHorizontalScrollSync($scope.$parent.containerId + 'footer', syncHorizontalFooter);
          }
          function syncVerticalScroll(scrollEvent) {
            containerCtrl.prevScrollArgs = scrollEvent;
            var newScrollTop = scrollEvent.getNewScrollTop(rowContainer, containerCtrl.viewport);
            $elm[0].scrollTop = newScrollTop;
          }
          function syncHorizontalScroll(scrollEvent) {
            containerCtrl.prevScrollArgs = scrollEvent;
            var newScrollLeft = scrollEvent.getNewScrollLeft(colContainer, containerCtrl.viewport);
            $elm[0].scrollLeft = gridUtil.denormalizeScrollLeft(containerCtrl.viewport, newScrollLeft, grid);
          }
          function syncHorizontalHeader(scrollEvent) {
            var newScrollLeft = scrollEvent.getNewScrollLeft(colContainer, containerCtrl.viewport);
            if (containerCtrl.headerViewport) {
              containerCtrl.headerViewport.scrollLeft = gridUtil.denormalizeScrollLeft(containerCtrl.viewport, newScrollLeft, grid);
            }
          }
          function syncHorizontalFooter(scrollEvent) {
            var newScrollLeft = scrollEvent.getNewScrollLeft(colContainer, containerCtrl.viewport);
            if (containerCtrl.footerViewport) {
              containerCtrl.footerViewport.scrollLeft = gridUtil.denormalizeScrollLeft(containerCtrl.viewport, newScrollLeft, grid);
            }
          }
        },
        controller: ['$scope', function($scope) {
          this.rowStyle = function(index) {
            var rowContainer = $scope.rowContainer;
            var colContainer = $scope.colContainer;
            var styles = {};
            if (index === 0 && rowContainer.currentTopRow !== 0) {
              var hiddenRowWidth = (rowContainer.currentTopRow) * rowContainer.grid.options.rowHeight;
              styles['margin-top'] = hiddenRowWidth + 'px';
            }
            if (colContainer.currentFirstColumn !== 0) {
              if (colContainer.grid.isRTL()) {
                styles['margin-right'] = colContainer.columnOffset + 'px';
              } else {
                styles['margin-left'] = colContainer.columnOffset + 'px';
              }
            }
            return styles;
          };
        }]
      };
    }]);
  })();
  (function() {
    angular.module('ui.grid').directive('uiGridVisible', function uiGridVisibleAction() {
      return function($scope, $elm, $attr) {
        $scope.$watch($attr.uiGridVisible, function(visible) {
          $elm[visible ? 'removeClass' : 'addClass']('ui-grid-invisible');
        });
      };
    });
  })();
  (function() {
    'use strict';
    angular.module('ui.grid').controller('uiGridController', ['$scope', '$element', '$attrs', 'gridUtil', '$q', 'uiGridConstants', '$templateCache', 'gridClassFactory', '$timeout', '$parse', '$compile', function($scope, $elm, $attrs, gridUtil, $q, uiGridConstants, $templateCache, gridClassFactory, $timeout, $parse, $compile) {
      var self = this;
      self.grid = gridClassFactory.createGrid($scope.uiGrid);
      self.grid.appScope = self.grid.appScope || $scope.$parent;
      $elm.addClass('grid' + self.grid.id);
      self.grid.rtl = gridUtil.getStyles($elm[0])['direction'] === 'rtl';
      $scope.grid = self.grid;
      if ($attrs.uiGridColumns) {
        $attrs.$observe('uiGridColumns', function(value) {
          self.grid.options.columnDefs = value;
          self.grid.buildColumns().then(function() {
            self.grid.preCompileCellTemplates();
            self.grid.refreshCanvas(true);
          });
        });
      }
      var deregFunctions = [];
      if (self.grid.options.fastWatch) {
        self.uiGrid = $scope.uiGrid;
        if (angular.isString($scope.uiGrid.data)) {
          deregFunctions.push($scope.$parent.$watch($scope.uiGrid.data, dataWatchFunction));
          deregFunctions.push($scope.$parent.$watch(function() {
            if (self.grid.appScope[$scope.uiGrid.data]) {
              return self.grid.appScope[$scope.uiGrid.data].length;
            } else {
              return undefined;
            }
          }, dataWatchFunction));
        } else {
          deregFunctions.push($scope.$parent.$watch(function() {
            return $scope.uiGrid.data;
          }, dataWatchFunction));
          deregFunctions.push($scope.$parent.$watch(function() {
            return $scope.uiGrid.data.length;
          }, function() {
            dataWatchFunction($scope.uiGrid.data);
          }));
        }
        deregFunctions.push($scope.$parent.$watch(function() {
          return $scope.uiGrid.columnDefs;
        }, columnDefsWatchFunction));
        deregFunctions.push($scope.$parent.$watch(function() {
          return $scope.uiGrid.columnDefs.length;
        }, function() {
          columnDefsWatchFunction($scope.uiGrid.columnDefs);
        }));
      } else {
        if (angular.isString($scope.uiGrid.data)) {
          deregFunctions.push($scope.$parent.$watchCollection($scope.uiGrid.data, dataWatchFunction));
        } else {
          deregFunctions.push($scope.$parent.$watchCollection(function() {
            return $scope.uiGrid.data;
          }, dataWatchFunction));
        }
        deregFunctions.push($scope.$parent.$watchCollection(function() {
          return $scope.uiGrid.columnDefs;
        }, columnDefsWatchFunction));
      }
      function columnDefsWatchFunction(n, o) {
        if (n && n !== o) {
          self.grid.options.columnDefs = $scope.uiGrid.columnDefs;
          self.grid.buildColumns({orderByColumnDefs: true}).then(function() {
            self.grid.preCompileCellTemplates();
            self.grid.callDataChangeCallbacks(uiGridConstants.dataChange.COLUMN);
          });
        }
      }
      var mostRecentData;
      function dataWatchFunction(newData) {
        var promises = [];
        if (self.grid.options.fastWatch) {
          if (angular.isString($scope.uiGrid.data)) {
            newData = self.grid.appScope[$scope.uiGrid.data];
          } else {
            newData = $scope.uiGrid.data;
          }
        }
        mostRecentData = newData;
        if (newData) {
          var hasColumns = self.grid.columns.length > (self.grid.rowHeaderColumns ? self.grid.rowHeaderColumns.length : 0);
          if (!hasColumns && !$attrs.uiGridColumns && self.grid.options.columnDefs.length === 0 && newData.length > 0) {
            self.grid.buildColumnDefsFromData(newData);
          }
          if (!hasColumns && (self.grid.options.columnDefs.length > 0 || newData.length > 0)) {
            promises.push(self.grid.buildColumns().then(function() {
              self.grid.preCompileCellTemplates();
            }));
          }
          $q.all(promises).then(function() {
            self.grid.modifyRows(mostRecentData).then(function() {
              self.grid.redrawInPlace(true);
              $scope.$evalAsync(function() {
                self.grid.refreshCanvas(true);
                self.grid.callDataChangeCallbacks(uiGridConstants.dataChange.ROW);
              });
            });
          });
        }
      }
      var styleWatchDereg = $scope.$watch(function() {
        return self.grid.styleComputations;
      }, function() {
        self.grid.refreshCanvas(true);
      });
      $scope.$on('$destroy', function() {
        deregFunctions.forEach(function(deregFn) {
          deregFn();
        });
        styleWatchDereg();
      });
      self.fireEvent = function(eventName, args) {
        if (typeof(args) === 'undefined' || args === undefined) {
          args = {};
        }
        if (typeof(args.grid) === 'undefined' || args.grid === undefined) {
          args.grid = self.grid;
        }
        $scope.$broadcast(eventName, args);
      };
      self.innerCompile = function innerCompile(elm) {
        $compile(elm)($scope);
      };
    }]);
    angular.module('ui.grid').directive('uiGrid', uiGridDirective);
    uiGridDirective.$inject = ['$compile', '$templateCache', '$timeout', '$window', 'gridUtil', 'uiGridConstants'];
    function uiGridDirective($compile, $templateCache, $timeout, $window, gridUtil, uiGridConstants) {
      return {
        templateUrl: 'ui-grid/ui-grid',
        scope: {uiGrid: '='},
        replace: true,
        transclude: true,
        controller: 'uiGridController',
        compile: function() {
          return {post: function($scope, $elm, $attrs, uiGridCtrl) {
              var grid = uiGridCtrl.grid;
              uiGridCtrl.scrollbars = [];
              grid.element = $elm;
              var sizeCheckInterval = 100;
              var maxSizeChecks = 20;
              var sizeChecks = 0;
              setup();
              init();
              grid.renderingComplete();
              checkSize();
              function checkSize() {
                if ($elm[0].offsetWidth <= 0 && sizeChecks < maxSizeChecks) {
                  setTimeout(checkSize, sizeCheckInterval);
                  sizeChecks++;
                } else {
                  $timeout(init);
                }
              }
              function setup() {
                angular.element($window).on('resize', gridResize);
                $elm.on('$destroy', function() {
                  angular.element($window).off('resize', gridResize);
                });
                $scope.$watch(function() {
                  return grid.hasLeftContainer();
                }, function(newValue, oldValue) {
                  if (newValue === oldValue) {
                    return;
                  }
                  grid.refreshCanvas(true);
                });
                $scope.$watch(function() {
                  return grid.hasRightContainer();
                }, function(newValue, oldValue) {
                  if (newValue === oldValue) {
                    return;
                  }
                  grid.refreshCanvas(true);
                });
              }
              function init() {
                grid.gridWidth = $scope.gridWidth = gridUtil.elementWidth($elm);
                grid.canvasWidth = uiGridCtrl.grid.gridWidth;
                grid.gridHeight = $scope.gridHeight = gridUtil.elementHeight($elm);
                if (grid.gridHeight <= grid.options.rowHeight && grid.options.enableMinHeightCheck) {
                  autoAdjustHeight();
                }
                grid.refreshCanvas(true);
              }
              function autoAdjustHeight() {
                var contentHeight = grid.options.minRowsToShow * grid.options.rowHeight;
                var headerHeight = grid.options.showHeader ? grid.options.headerRowHeight : 0;
                var footerHeight = grid.calcFooterHeight();
                var scrollbarHeight = 0;
                if (grid.options.enableHorizontalScrollbar === uiGridConstants.scrollbars.ALWAYS) {
                  scrollbarHeight = gridUtil.getScrollbarWidth();
                }
                var maxNumberOfFilters = 0;
                angular.forEach(grid.options.columnDefs, function(col) {
                  if (col.hasOwnProperty('filter')) {
                    if (maxNumberOfFilters < 1) {
                      maxNumberOfFilters = 1;
                    }
                  } else if (col.hasOwnProperty('filters')) {
                    if (maxNumberOfFilters < col.filters.length) {
                      maxNumberOfFilters = col.filters.length;
                    }
                  }
                });
                if (grid.options.enableFiltering && !maxNumberOfFilters) {
                  var allColumnsHaveFilteringTurnedOff = grid.options.columnDefs.length && grid.options.columnDefs.every(function(col) {
                    return col.enableFiltering === false;
                  });
                  if (!allColumnsHaveFilteringTurnedOff) {
                    maxNumberOfFilters = 1;
                  }
                }
                var filterHeight = maxNumberOfFilters * headerHeight;
                var newHeight = headerHeight + contentHeight + footerHeight + scrollbarHeight + filterHeight;
                $elm.css('height', newHeight + 'px');
                grid.gridHeight = $scope.gridHeight = gridUtil.elementHeight($elm);
              }
              function gridResize($event) {
                grid.gridWidth = $scope.gridWidth = gridUtil.elementWidth($elm);
                grid.gridHeight = $scope.gridHeight = gridUtil.elementHeight($elm);
                grid.refreshCanvas(true);
              }
            }};
        }
      };
    }
  })();
  (function() {
    'use strict';
    angular.module('ui.grid').directive('uiGridPinnedContainer', ['gridUtil', function(gridUtil) {
      return {
        restrict: 'EA',
        replace: true,
        template: '<div class="ui-grid-pinned-container"><div ui-grid-render-container container-id="side" row-container-name="\'body\'" col-container-name="side" bind-scroll-vertical="true" class="{{ side }} ui-grid-render-container-{{ side }}"></div></div>',
        scope: {side: '=uiGridPinnedContainer'},
        require: '^uiGrid',
        compile: function compile() {
          return {post: function($scope, $elm, $attrs, uiGridCtrl) {
              var grid = uiGridCtrl.grid;
              var myWidth = 0;
              $elm.addClass('ui-grid-pinned-container-' + $scope.side);
              if ($scope.side === 'left' || $scope.side === 'right') {
                grid.renderContainers[$scope.side].getViewportWidth = monkeyPatchedGetViewportWidth;
              }
              function monkeyPatchedGetViewportWidth() {
                var self = this;
                var viewportWidth = 0;
                self.visibleColumnCache.forEach(function(column) {
                  viewportWidth += column.drawnWidth;
                });
                var adjustment = self.getViewportAdjustment();
                viewportWidth = viewportWidth + adjustment.width;
                return viewportWidth;
              }
              function updateContainerWidth() {
                if ($scope.side === 'left' || $scope.side === 'right') {
                  var cols = grid.renderContainers[$scope.side].visibleColumnCache;
                  var width = 0;
                  for (var i = 0; i < cols.length; i++) {
                    var col = cols[i];
                    width += col.drawnWidth || col.width || 0;
                  }
                  return width;
                }
              }
              function updateContainerDimensions() {
                var ret = '';
                if ($scope.side === 'left' || $scope.side === 'right') {
                  myWidth = updateContainerWidth();
                  $elm.attr('style', null);
                  ret += '.grid' + grid.id + ' .ui-grid-pinned-container-' + $scope.side + ', .grid' + grid.id + ' .ui-grid-pinned-container-' + $scope.side + ' .ui-grid-render-container-' + $scope.side + ' .ui-grid-viewport { width: ' + myWidth + 'px; } ';
                }
                return ret;
              }
              grid.renderContainers.body.registerViewportAdjuster(function(adjustment) {
                myWidth = updateContainerWidth();
                adjustment.width -= myWidth;
                adjustment.side = $scope.side;
                return adjustment;
              });
              grid.registerStyleComputation({
                priority: 15,
                func: updateContainerDimensions
              });
            }};
        }
      };
    }]);
  })();
  (function() {
    angular.module('ui.grid').factory('Grid', ['$q', '$compile', '$parse', 'gridUtil', 'uiGridConstants', 'GridOptions', 'GridColumn', 'GridRow', 'GridApi', 'rowSorter', 'rowSearcher', 'GridRenderContainer', '$timeout', 'ScrollEvent', function($q, $compile, $parse, gridUtil, uiGridConstants, GridOptions, GridColumn, GridRow, GridApi, rowSorter, rowSearcher, GridRenderContainer, $timeout, ScrollEvent) {
      var Grid = function Grid(options) {
        var self = this;
        if (options !== undefined && typeof(options.id) !== 'undefined' && options.id) {
          if (!/^[_a-zA-Z0-9-]+$/.test(options.id)) {
            throw new Error("Grid id '" + options.id + '" is invalid. It must follow CSS selector syntax rules.');
          }
        } else {
          throw new Error('No ID provided. An ID must be given when creating a grid.');
        }
        self.id = options.id;
        delete options.id;
        self.options = GridOptions.initialize(options);
        self.appScope = self.options.appScopeProvider;
        self.headerHeight = self.options.headerRowHeight;
        self.footerHeight = self.calcFooterHeight();
        self.columnFooterHeight = self.calcColumnFooterHeight();
        self.rtl = false;
        self.gridHeight = 0;
        self.gridWidth = 0;
        self.columnBuilders = [];
        self.rowBuilders = [];
        self.rowsProcessors = [];
        self.columnsProcessors = [];
        self.styleComputations = [];
        self.viewportAdjusters = [];
        self.rowHeaderColumns = [];
        self.dataChangeCallbacks = {};
        self.verticalScrollSyncCallBackFns = {};
        self.horizontalScrollSyncCallBackFns = {};
        self.renderContainers = {};
        self.renderContainers.body = new GridRenderContainer('body', self);
        self.cellValueGetterCache = {};
        self.getRowTemplateFn = null;
        self.rows = [];
        self.columns = [];
        self.isScrollingVertically = false;
        self.isScrollingHorizontally = false;
        self.scrollDirection = uiGridConstants.scrollDirection.NONE;
        self.disableScrolling = false;
        function vertical(scrollEvent) {
          self.isScrollingVertically = false;
          self.api.core.raise.scrollEnd(scrollEvent);
          self.scrollDirection = uiGridConstants.scrollDirection.NONE;
        }
        var debouncedVertical = gridUtil.debounce(vertical, self.options.scrollDebounce);
        var debouncedVerticalMinDelay = gridUtil.debounce(vertical, 0);
        function horizontal(scrollEvent) {
          self.isScrollingHorizontally = false;
          self.api.core.raise.scrollEnd(scrollEvent);
          self.scrollDirection = uiGridConstants.scrollDirection.NONE;
        }
        var debouncedHorizontal = gridUtil.debounce(horizontal, self.options.scrollDebounce);
        var debouncedHorizontalMinDelay = gridUtil.debounce(horizontal, 0);
        self.flagScrollingVertically = function(scrollEvent) {
          if (!self.isScrollingVertically && !self.isScrollingHorizontally) {
            self.api.core.raise.scrollBegin(scrollEvent);
          }
          self.isScrollingVertically = true;
          if (self.options.scrollDebounce === 0 || !scrollEvent.withDelay) {
            debouncedVerticalMinDelay(scrollEvent);
          } else {
            debouncedVertical(scrollEvent);
          }
        };
        self.flagScrollingHorizontally = function(scrollEvent) {
          if (!self.isScrollingVertically && !self.isScrollingHorizontally) {
            self.api.core.raise.scrollBegin(scrollEvent);
          }
          self.isScrollingHorizontally = true;
          if (self.options.scrollDebounce === 0 || !scrollEvent.withDelay) {
            debouncedHorizontalMinDelay(scrollEvent);
          } else {
            debouncedHorizontal(scrollEvent);
          }
        };
        self.scrollbarHeight = 0;
        self.scrollbarWidth = 0;
        if (self.options.enableHorizontalScrollbar === uiGridConstants.scrollbars.ALWAYS) {
          self.scrollbarHeight = gridUtil.getScrollbarWidth();
        }
        if (self.options.enableVerticalScrollbar === uiGridConstants.scrollbars.ALWAYS) {
          self.scrollbarWidth = gridUtil.getScrollbarWidth();
        }
        self.api = new GridApi(self);
        self.api.registerMethod('core', 'refresh', this.refresh);
        self.api.registerMethod('core', 'queueGridRefresh', this.queueGridRefresh);
        self.api.registerMethod('core', 'refreshRows', this.refreshRows);
        self.api.registerMethod('core', 'queueRefresh', this.queueRefresh);
        self.api.registerMethod('core', 'handleWindowResize', this.handleWindowResize);
        self.api.registerMethod('core', 'addRowHeaderColumn', this.addRowHeaderColumn);
        self.api.registerMethod('core', 'scrollToIfNecessary', function(gridRow, gridCol) {
          return self.scrollToIfNecessary(gridRow, gridCol);
        });
        self.api.registerMethod('core', 'scrollTo', function(rowEntity, colDef) {
          return self.scrollTo(rowEntity, colDef);
        });
        self.api.registerMethod('core', 'registerRowsProcessor', this.registerRowsProcessor);
        self.api.registerMethod('core', 'registerColumnsProcessor', this.registerColumnsProcessor);
        self.api.registerMethod('core', 'sortHandleNulls', rowSorter.handleNulls);
        self.api.registerEvent('core', 'sortChanged');
        self.api.registerEvent('core', 'columnVisibilityChanged');
        self.api.registerMethod('core', 'notifyDataChange', this.notifyDataChange);
        self.api.registerMethod('core', 'clearAllFilters', this.clearAllFilters);
        self.registerDataChangeCallback(self.columnRefreshCallback, [uiGridConstants.dataChange.COLUMN]);
        self.registerDataChangeCallback(self.processRowsCallback, [uiGridConstants.dataChange.EDIT]);
        self.registerDataChangeCallback(self.updateFooterHeightCallback, [uiGridConstants.dataChange.OPTIONS]);
        self.registerStyleComputation({
          priority: 10,
          func: self.getFooterStyles
        });
      };
      Grid.prototype.calcFooterHeight = function() {
        if (!this.hasFooter()) {
          return 0;
        }
        var height = 0;
        if (this.options.showGridFooter) {
          height += this.options.gridFooterHeight;
        }
        height += this.calcColumnFooterHeight();
        return height;
      };
      Grid.prototype.calcColumnFooterHeight = function() {
        var height = 0;
        if (this.options.showColumnFooter) {
          height += this.options.columnFooterHeight;
        }
        return height;
      };
      Grid.prototype.getFooterStyles = function() {
        var style = '.grid' + this.id + ' .ui-grid-footer-aggregates-row { height: ' + this.options.columnFooterHeight + 'px; }';
        style += ' .grid' + this.id + ' .ui-grid-footer-info { height: ' + this.options.gridFooterHeight + 'px; }';
        return style;
      };
      Grid.prototype.hasFooter = function() {
        return this.options.showGridFooter || this.options.showColumnFooter;
      };
      Grid.prototype.isRTL = function() {
        return this.rtl;
      };
      Grid.prototype.registerColumnBuilder = function registerColumnBuilder(columnBuilder) {
        this.columnBuilders.push(columnBuilder);
      };
      Grid.prototype.buildColumnDefsFromData = function(dataRows) {
        this.options.columnDefs = gridUtil.getColumnsFromData(dataRows, this.options.excludeProperties);
      };
      Grid.prototype.registerRowBuilder = function registerRowBuilder(rowBuilder) {
        this.rowBuilders.push(rowBuilder);
      };
      Grid.prototype.registerDataChangeCallback = function registerDataChangeCallback(callback, types, _this) {
        var uid = gridUtil.nextUid();
        if (!types) {
          types = [uiGridConstants.dataChange.ALL];
        }
        if (!Array.isArray(types)) {
          gridUtil.logError("Expected types to be an array or null in registerDataChangeCallback, value passed was: " + types);
        }
        this.dataChangeCallbacks[uid] = {
          callback: callback,
          types: types,
          _this: _this
        };
        var self = this;
        var deregisterFunction = function() {
          delete self.dataChangeCallbacks[uid];
        };
        return deregisterFunction;
      };
      Grid.prototype.callDataChangeCallbacks = function callDataChangeCallbacks(type, options) {
        angular.forEach(this.dataChangeCallbacks, function(callback, uid) {
          if (callback.types.indexOf(uiGridConstants.dataChange.ALL) !== -1 || callback.types.indexOf(type) !== -1 || type === uiGridConstants.dataChange.ALL) {
            if (callback._this) {
              callback.callback.apply(callback._this, this);
            } else {
              callback.callback(this);
            }
          }
        }, this);
      };
      Grid.prototype.notifyDataChange = function notifyDataChange(type) {
        var constants = uiGridConstants.dataChange;
        if (type === constants.ALL || type === constants.COLUMN || type === constants.EDIT || type === constants.ROW || type === constants.OPTIONS) {
          this.callDataChangeCallbacks(type);
        } else {
          gridUtil.logError("Notified of a data change, but the type was not recognised, so no action taken, type was: " + type);
        }
      };
      Grid.prototype.columnRefreshCallback = function columnRefreshCallback(grid) {
        grid.buildColumns();
        grid.queueGridRefresh();
      };
      Grid.prototype.processRowsCallback = function processRowsCallback(grid) {
        grid.queueGridRefresh();
      };
      Grid.prototype.updateFooterHeightCallback = function updateFooterHeightCallback(grid) {
        grid.footerHeight = grid.calcFooterHeight();
        grid.columnFooterHeight = grid.calcColumnFooterHeight();
      };
      Grid.prototype.getColumn = function getColumn(name) {
        var columns = this.columns.filter(function(column) {
          return column.colDef.name === name;
        });
        return columns.length > 0 ? columns[0] : null;
      };
      Grid.prototype.getColDef = function getColDef(name) {
        var colDefs = this.options.columnDefs.filter(function(colDef) {
          return colDef.name === name;
        });
        return colDefs.length > 0 ? colDefs[0] : null;
      };
      Grid.prototype.assignTypes = function() {
        var self = this;
        self.options.columnDefs.forEach(function(colDef, index) {
          if (!colDef.type) {
            var col = new GridColumn(colDef, index, self);
            var firstRow = self.rows.length > 0 ? self.rows[0] : null;
            if (firstRow) {
              colDef.type = gridUtil.guessType(self.getCellValue(firstRow, col));
            } else {
              colDef.type = 'string';
            }
          }
        });
      };
      Grid.prototype.isRowHeaderColumn = function isRowHeaderColumn(column) {
        return this.rowHeaderColumns.indexOf(column) !== -1;
      };
      Grid.prototype.addRowHeaderColumn = function addRowHeaderColumn(colDef) {
        var self = this;
        var rowHeaderCol = new GridColumn(colDef, gridUtil.nextUid(), self);
        rowHeaderCol.isRowHeader = true;
        if (self.isRTL()) {
          self.createRightContainer();
          rowHeaderCol.renderContainer = 'right';
        } else {
          self.createLeftContainer();
          rowHeaderCol.renderContainer = 'left';
        }
        self.columnBuilders[0](colDef, rowHeaderCol, self.options).then(function() {
          rowHeaderCol.enableFiltering = false;
          rowHeaderCol.enableSorting = false;
          rowHeaderCol.enableHiding = false;
          self.rowHeaderColumns.push(rowHeaderCol);
          self.buildColumns().then(function() {
            self.preCompileCellTemplates();
            self.queueGridRefresh();
          });
        });
      };
      Grid.prototype.getOnlyDataColumns = function getOnlyDataColumns() {
        var self = this;
        var cols = [];
        self.columns.forEach(function(col) {
          if (self.rowHeaderColumns.indexOf(col) === -1) {
            cols.push(col);
          }
        });
        return cols;
      };
      Grid.prototype.buildColumns = function buildColumns(opts) {
        var options = {orderByColumnDefs: false};
        angular.extend(options, opts);
        var self = this;
        var builderPromises = [];
        var headerOffset = self.rowHeaderColumns.length;
        var i;
        for (i = 0; i < self.columns.length; i++) {
          if (!self.getColDef(self.columns[i].name)) {
            self.columns.splice(i, 1);
            i--;
          }
        }
        self.rowHeaderColumns.forEach(function(rowHeaderColumn) {
          self.columns.unshift(rowHeaderColumn);
        });
        self.options.columnDefs.forEach(function(colDef, index) {
          self.preprocessColDef(colDef);
          var col = self.getColumn(colDef.name);
          if (!col) {
            col = new GridColumn(colDef, gridUtil.nextUid(), self);
            self.columns.splice(index + headerOffset, 0, col);
          } else {
            col.updateColumnDef(colDef, false);
          }
          self.columnBuilders.forEach(function(builder) {
            builderPromises.push(builder.call(self, colDef, col, self.options));
          });
        });
        if (!!options.orderByColumnDefs) {
          var columnCache = self.columns.slice(0);
          var len = Math.min(self.options.columnDefs.length, self.columns.length);
          for (i = 0; i < len; i++) {
            if (self.columns[i + headerOffset].name !== self.options.columnDefs[i].name) {
              columnCache[i + headerOffset] = self.getColumn(self.options.columnDefs[i].name);
            } else {
              columnCache[i + headerOffset] = self.columns[i + headerOffset];
            }
          }
          self.columns.length = 0;
          Array.prototype.splice.apply(self.columns, [0, 0].concat(columnCache));
        }
        return $q.all(builderPromises).then(function() {
          if (self.rows.length > 0) {
            self.assignTypes();
          }
        });
      };
      Grid.prototype.preCompileCellTemplates = function() {
        var self = this;
        var preCompileTemplate = function(col) {
          var html = col.cellTemplate.replace(uiGridConstants.MODEL_COL_FIELD, self.getQualifiedColField(col));
          html = html.replace(uiGridConstants.COL_FIELD, 'grid.getCellValue(row, col)');
          var compiledElementFn = $compile(html);
          col.compiledElementFn = compiledElementFn;
          if (col.compiledElementFnDefer) {
            col.compiledElementFnDefer.resolve(col.compiledElementFn);
          }
        };
        this.columns.forEach(function(col) {
          if (col.cellTemplate) {
            preCompileTemplate(col);
          } else if (col.cellTemplatePromise) {
            col.cellTemplatePromise.then(function() {
              preCompileTemplate(col);
            });
          }
        });
      };
      Grid.prototype.getQualifiedColField = function(col) {
        return 'row.entity.' + gridUtil.preEval(col.field);
      };
      Grid.prototype.createLeftContainer = function() {
        if (!this.hasLeftContainer()) {
          this.renderContainers.left = new GridRenderContainer('left', this, {disableColumnOffset: true});
        }
      };
      Grid.prototype.createRightContainer = function() {
        if (!this.hasRightContainer()) {
          this.renderContainers.right = new GridRenderContainer('right', this, {disableColumnOffset: true});
        }
      };
      Grid.prototype.hasLeftContainer = function() {
        return this.renderContainers.left !== undefined;
      };
      Grid.prototype.hasRightContainer = function() {
        return this.renderContainers.right !== undefined;
      };
      Grid.prototype.preprocessColDef = function preprocessColDef(colDef) {
        var self = this;
        if (!colDef.field && !colDef.name) {
          throw new Error('colDef.name or colDef.field property is required');
        }
        if (colDef.name === undefined && colDef.field !== undefined) {
          var newName = colDef.field,
              counter = 2;
          while (self.getColumn(newName)) {
            newName = colDef.field + counter.toString();
            counter++;
          }
          colDef.name = newName;
        }
      };
      Grid.prototype.newInN = function newInN(o, n, oAccessor, nAccessor) {
        var self = this;
        var t = [];
        for (var i = 0; i < n.length; i++) {
          var nV = nAccessor ? n[i][nAccessor] : n[i];
          var found = false;
          for (var j = 0; j < o.length; j++) {
            var oV = oAccessor ? o[j][oAccessor] : o[j];
            if (self.options.rowEquality(nV, oV)) {
              found = true;
              break;
            }
          }
          if (!found) {
            t.push(nV);
          }
        }
        return t;
      };
      Grid.prototype.getRow = function getRow(rowEntity, lookInRows) {
        var self = this;
        lookInRows = typeof(lookInRows) === 'undefined' ? self.rows : lookInRows;
        var rows = lookInRows.filter(function(row) {
          return self.options.rowEquality(row.entity, rowEntity);
        });
        return rows.length > 0 ? rows[0] : null;
      };
      Grid.prototype.modifyRows = function modifyRows(newRawData) {
        var self = this;
        var oldRows = self.rows.slice(0);
        var oldRowHash = self.rowHashMap || self.createRowHashMap();
        self.rowHashMap = self.createRowHashMap();
        self.rows.length = 0;
        newRawData.forEach(function(newEntity, i) {
          var newRow;
          if (self.options.enableRowHashing) {
            newRow = oldRowHash.get(newEntity);
          } else {
            newRow = self.getRow(newEntity, oldRows);
          }
          if (!newRow) {
            newRow = self.processRowBuilders(new GridRow(newEntity, i, self));
          }
          self.rows.push(newRow);
          self.rowHashMap.put(newEntity, newRow);
        });
        self.assignTypes();
        var p1 = $q.when(self.processRowsProcessors(self.rows)).then(function(renderableRows) {
          return self.setVisibleRows(renderableRows);
        });
        var p2 = $q.when(self.processColumnsProcessors(self.columns)).then(function(renderableColumns) {
          return self.setVisibleColumns(renderableColumns);
        });
        return $q.all([p1, p2]);
      };
      Grid.prototype.addRows = function addRows(newRawData) {
        var self = this;
        var existingRowCount = self.rows.length;
        for (var i = 0; i < newRawData.length; i++) {
          var newRow = self.processRowBuilders(new GridRow(newRawData[i], i + existingRowCount, self));
          if (self.options.enableRowHashing) {
            var found = self.rowHashMap.get(newRow.entity);
            if (found) {
              found.row = newRow;
            }
          }
          self.rows.push(newRow);
        }
      };
      Grid.prototype.processRowBuilders = function processRowBuilders(gridRow) {
        var self = this;
        self.rowBuilders.forEach(function(builder) {
          builder.call(self, gridRow, self.options);
        });
        return gridRow;
      };
      Grid.prototype.registerStyleComputation = function registerStyleComputation(styleComputationInfo) {
        this.styleComputations.push(styleComputationInfo);
      };
      Grid.prototype.registerRowsProcessor = function registerRowsProcessor(processor, priority) {
        if (!angular.isFunction(processor)) {
          throw 'Attempt to register non-function rows processor: ' + processor;
        }
        this.rowsProcessors.push({
          processor: processor,
          priority: priority
        });
        this.rowsProcessors.sort(function sortByPriority(a, b) {
          return a.priority - b.priority;
        });
      };
      Grid.prototype.removeRowsProcessor = function removeRowsProcessor(processor) {
        var idx = -1;
        this.rowsProcessors.forEach(function(rowsProcessor, index) {
          if (rowsProcessor.processor === processor) {
            idx = index;
          }
        });
        if (idx !== -1) {
          this.rowsProcessors.splice(idx, 1);
        }
      };
      Grid.prototype.processRowsProcessors = function processRowsProcessors(renderableRows) {
        var self = this;
        var myRenderableRows = renderableRows.slice(0);
        if (self.rowsProcessors.length === 0) {
          return $q.when(myRenderableRows);
        }
        var i = 0;
        var finished = $q.defer();
        function startProcessor(i, renderedRowsToProcess) {
          var processor = self.rowsProcessors[i].processor;
          return $q.when(processor.call(self, renderedRowsToProcess, self.columns)).then(function handleProcessedRows(processedRows) {
            if (!processedRows) {
              throw "Processor at index " + i + " did not return a set of renderable rows";
            }
            if (!angular.isArray(processedRows)) {
              throw "Processor at index " + i + " did not return an array";
            }
            i++;
            if (i <= self.rowsProcessors.length - 1) {
              return startProcessor(i, processedRows);
            } else {
              finished.resolve(processedRows);
            }
          });
        }
        startProcessor(0, myRenderableRows);
        return finished.promise;
      };
      Grid.prototype.setVisibleRows = function setVisibleRows(rows) {
        var self = this;
        for (var i in self.renderContainers) {
          var container = self.renderContainers[i];
          container.canvasHeightShouldUpdate = true;
          if (typeof(container.visibleRowCache) === 'undefined') {
            container.visibleRowCache = [];
          } else {
            container.visibleRowCache.length = 0;
          }
        }
        for (var ri = 0; ri < rows.length; ri++) {
          var row = rows[ri];
          var targetContainer = (typeof(row.renderContainer) !== 'undefined' && row.renderContainer) ? row.renderContainer : 'body';
          if (row.visible) {
            self.renderContainers[targetContainer].visibleRowCache.push(row);
          }
        }
        self.api.core.raise.rowsRendered(this.api);
      };
      Grid.prototype.registerColumnsProcessor = function registerColumnsProcessor(processor, priority) {
        if (!angular.isFunction(processor)) {
          throw 'Attempt to register non-function rows processor: ' + processor;
        }
        this.columnsProcessors.push({
          processor: processor,
          priority: priority
        });
        this.columnsProcessors.sort(function sortByPriority(a, b) {
          return a.priority - b.priority;
        });
      };
      Grid.prototype.removeColumnsProcessor = function removeColumnsProcessor(processor) {
        var idx = this.columnsProcessors.indexOf(processor);
        if (typeof(idx) !== 'undefined' && idx !== undefined) {
          this.columnsProcessors.splice(idx, 1);
        }
      };
      Grid.prototype.processColumnsProcessors = function processColumnsProcessors(renderableColumns) {
        var self = this;
        var myRenderableColumns = renderableColumns.slice(0);
        if (self.columnsProcessors.length === 0) {
          return $q.when(myRenderableColumns);
        }
        var i = 0;
        var finished = $q.defer();
        function startProcessor(i, renderedColumnsToProcess) {
          var processor = self.columnsProcessors[i].processor;
          return $q.when(processor.call(self, renderedColumnsToProcess, self.rows)).then(function handleProcessedRows(processedColumns) {
            if (!processedColumns) {
              throw "Processor at index " + i + " did not return a set of renderable rows";
            }
            if (!angular.isArray(processedColumns)) {
              throw "Processor at index " + i + " did not return an array";
            }
            i++;
            if (i <= self.columnsProcessors.length - 1) {
              return startProcessor(i, myRenderableColumns);
            } else {
              finished.resolve(myRenderableColumns);
            }
          });
        }
        startProcessor(0, myRenderableColumns);
        return finished.promise;
      };
      Grid.prototype.setVisibleColumns = function setVisibleColumns(columns) {
        var self = this;
        for (var i in self.renderContainers) {
          var container = self.renderContainers[i];
          container.visibleColumnCache.length = 0;
        }
        for (var ci = 0; ci < columns.length; ci++) {
          var column = columns[ci];
          if (column.visible) {
            if (typeof(column.renderContainer) !== 'undefined' && column.renderContainer) {
              self.renderContainers[column.renderContainer].visibleColumnCache.push(column);
            } else {
              self.renderContainers.body.visibleColumnCache.push(column);
            }
          }
        }
      };
      Grid.prototype.handleWindowResize = function handleWindowResize($event) {
        var self = this;
        self.gridWidth = gridUtil.elementWidth(self.element);
        self.gridHeight = gridUtil.elementHeight(self.element);
        return self.queueRefresh();
      };
      Grid.prototype.queueRefresh = function queueRefresh() {
        var self = this;
        if (self.refreshCanceller) {
          $timeout.cancel(self.refreshCanceller);
        }
        self.refreshCanceller = $timeout(function() {
          self.refreshCanvas(true);
        });
        self.refreshCanceller.then(function() {
          self.refreshCanceller = null;
        });
        return self.refreshCanceller;
      };
      Grid.prototype.queueGridRefresh = function queueGridRefresh() {
        var self = this;
        if (self.gridRefreshCanceller) {
          $timeout.cancel(self.gridRefreshCanceller);
        }
        self.gridRefreshCanceller = $timeout(function() {
          self.refresh(true);
        });
        self.gridRefreshCanceller.then(function() {
          self.gridRefreshCanceller = null;
        });
        return self.gridRefreshCanceller;
      };
      Grid.prototype.updateCanvasHeight = function updateCanvasHeight() {
        var self = this;
        for (var containerId in self.renderContainers) {
          if (self.renderContainers.hasOwnProperty(containerId)) {
            var container = self.renderContainers[containerId];
            container.canvasHeightShouldUpdate = true;
          }
        }
      };
      Grid.prototype.buildStyles = function buildStyles() {
        var self = this;
        self.customStyles = '';
        self.styleComputations.sort(function(a, b) {
          if (a.priority === null) {
            return 1;
          }
          if (b.priority === null) {
            return -1;
          }
          if (a.priority === null && b.priority === null) {
            return 0;
          }
          return a.priority - b.priority;
        }).forEach(function(compInfo) {
          var ret = compInfo.func.call(self);
          if (angular.isString(ret)) {
            self.customStyles += '\n' + ret;
          }
        });
      };
      Grid.prototype.minColumnsToRender = function minColumnsToRender() {
        var self = this;
        var viewport = this.getViewportWidth();
        var min = 0;
        var totalWidth = 0;
        self.columns.forEach(function(col, i) {
          if (totalWidth < viewport) {
            totalWidth += col.drawnWidth;
            min++;
          } else {
            var currWidth = 0;
            for (var j = i; j >= i - min; j--) {
              currWidth += self.columns[j].drawnWidth;
            }
            if (currWidth < viewport) {
              min++;
            }
          }
        });
        return min;
      };
      Grid.prototype.getBodyHeight = function getBodyHeight() {
        var bodyHeight = this.getViewportHeight();
        return bodyHeight;
      };
      Grid.prototype.getViewportHeight = function getViewportHeight() {
        var self = this;
        var viewPortHeight = this.gridHeight - this.headerHeight - this.footerHeight;
        var adjustment = self.getViewportAdjustment();
        viewPortHeight = viewPortHeight + adjustment.height;
        return viewPortHeight;
      };
      Grid.prototype.getViewportWidth = function getViewportWidth() {
        var self = this;
        var viewPortWidth = this.gridWidth;
        var adjustment = self.getViewportAdjustment();
        viewPortWidth = viewPortWidth + adjustment.width;
        return viewPortWidth;
      };
      Grid.prototype.getHeaderViewportWidth = function getHeaderViewportWidth() {
        var viewPortWidth = this.getViewportWidth();
        return viewPortWidth;
      };
      Grid.prototype.addVerticalScrollSync = function(containerId, callBackFn) {
        this.verticalScrollSyncCallBackFns[containerId] = callBackFn;
      };
      Grid.prototype.addHorizontalScrollSync = function(containerId, callBackFn) {
        this.horizontalScrollSyncCallBackFns[containerId] = callBackFn;
      };
      Grid.prototype.scrollContainers = function(sourceContainerId, scrollEvent) {
        if (scrollEvent.y) {
          var verts = ['body', 'left', 'right'];
          this.flagScrollingVertically(scrollEvent);
          if (sourceContainerId === 'body') {
            verts = ['left', 'right'];
          } else if (sourceContainerId === 'left') {
            verts = ['body', 'right'];
          } else if (sourceContainerId === 'right') {
            verts = ['body', 'left'];
          }
          for (var i = 0; i < verts.length; i++) {
            var id = verts[i];
            if (this.verticalScrollSyncCallBackFns[id]) {
              this.verticalScrollSyncCallBackFns[id](scrollEvent);
            }
          }
        }
        if (scrollEvent.x) {
          var horizs = ['body', 'bodyheader', 'bodyfooter'];
          this.flagScrollingHorizontally(scrollEvent);
          if (sourceContainerId === 'body') {
            horizs = ['bodyheader', 'bodyfooter'];
          }
          for (var j = 0; j < horizs.length; j++) {
            var idh = horizs[j];
            if (this.horizontalScrollSyncCallBackFns[idh]) {
              this.horizontalScrollSyncCallBackFns[idh](scrollEvent);
            }
          }
        }
      };
      Grid.prototype.registerViewportAdjuster = function registerViewportAdjuster(func) {
        this.viewportAdjusters.push(func);
      };
      Grid.prototype.removeViewportAdjuster = function registerViewportAdjuster(func) {
        var idx = this.viewportAdjusters.indexOf(func);
        if (typeof(idx) !== 'undefined' && idx !== undefined) {
          this.viewportAdjusters.splice(idx, 1);
        }
      };
      Grid.prototype.getViewportAdjustment = function getViewportAdjustment() {
        var self = this;
        var adjustment = {
          height: 0,
          width: 0
        };
        self.viewportAdjusters.forEach(function(func) {
          adjustment = func.call(this, adjustment);
        });
        return adjustment;
      };
      Grid.prototype.getVisibleRowCount = function getVisibleRowCount() {
        return this.renderContainers.body.visibleRowCache.length;
      };
      Grid.prototype.getVisibleRows = function getVisibleRows() {
        return this.renderContainers.body.visibleRowCache;
      };
      Grid.prototype.getVisibleColumnCount = function getVisibleColumnCount() {
        return this.renderContainers.body.visibleColumnCache.length;
      };
      Grid.prototype.searchRows = function searchRows(renderableRows) {
        return rowSearcher.search(this, renderableRows, this.columns);
      };
      Grid.prototype.sortByColumn = function sortByColumn(renderableRows) {
        return rowSorter.sort(this, renderableRows, this.columns);
      };
      Grid.prototype.getCellValue = function getCellValue(row, col) {
        if (typeof(row.entity['$$' + col.uid]) !== 'undefined') {
          return row.entity['$$' + col.uid].rendered;
        } else if (this.options.flatEntityAccess && typeof(col.field) !== 'undefined') {
          return row.entity[col.field];
        } else {
          if (!col.cellValueGetterCache) {
            col.cellValueGetterCache = $parse(row.getEntityQualifiedColField(col));
          }
          return col.cellValueGetterCache(row);
        }
      };
      Grid.prototype.getCellDisplayValue = function getCellDisplayValue(row, col) {
        if (!col.cellDisplayGetterCache) {
          var custom_filter = col.cellFilter ? " | " + col.cellFilter : "";
          if (typeof(row.entity['$$' + col.uid]) !== 'undefined') {
            col.cellDisplayGetterCache = $parse(row.entity['$$' + col.uid].rendered + custom_filter);
          } else if (this.options.flatEntityAccess && typeof(col.field) !== 'undefined') {
            col.cellDisplayGetterCache = $parse(row.entity[col.field] + custom_filter);
          } else {
            col.cellDisplayGetterCache = $parse(row.getEntityQualifiedColField(col) + custom_filter);
          }
        }
        return col.cellDisplayGetterCache(row);
      };
      Grid.prototype.getNextColumnSortPriority = function getNextColumnSortPriority() {
        var self = this,
            p = 0;
        self.columns.forEach(function(col) {
          if (col.sort && col.sort.priority !== undefined && col.sort.priority >= p) {
            p = col.sort.priority + 1;
          }
        });
        return p;
      };
      Grid.prototype.resetColumnSorting = function resetColumnSorting(excludeCol) {
        var self = this;
        self.columns.forEach(function(col) {
          if (col !== excludeCol && !col.suppressRemoveSort) {
            col.sort = {};
          }
        });
      };
      Grid.prototype.getColumnSorting = function getColumnSorting() {
        var self = this;
        var sortedCols = [],
            myCols;
        myCols = self.columns.slice(0);
        myCols.sort(rowSorter.prioritySort).forEach(function(col) {
          if (col.sort && typeof(col.sort.direction) !== 'undefined' && col.sort.direction && (col.sort.direction === uiGridConstants.ASC || col.sort.direction === uiGridConstants.DESC)) {
            sortedCols.push(col);
          }
        });
        return sortedCols;
      };
      Grid.prototype.sortColumn = function sortColumn(column, directionOrAdd, add) {
        var self = this,
            direction = null;
        if (typeof(column) === 'undefined' || !column) {
          throw new Error('No column parameter provided');
        }
        if (typeof(directionOrAdd) === 'boolean') {
          add = directionOrAdd;
        } else {
          direction = directionOrAdd;
        }
        if (!add) {
          self.resetColumnSorting(column);
          column.sort.priority = undefined;
          column.sort.priority = self.getNextColumnSortPriority();
        } else if (!column.sort.priority) {
          column.sort.priority = self.getNextColumnSortPriority();
        }
        if (!direction) {
          var i = column.sortDirectionCycle.indexOf(column.sort.direction ? column.sort.direction : null);
          i = (i + 1) % column.sortDirectionCycle.length;
          if (column.colDef && column.suppressRemoveSort && !column.sortDirectionCycle[i]) {
            i = (i + 1) % column.sortDirectionCycle.length;
          }
          if (column.sortDirectionCycle[i]) {
            column.sort.direction = column.sortDirectionCycle[i];
          } else {
            column.sort = {};
          }
        } else {
          column.sort.direction = direction;
        }
        self.api.core.raise.sortChanged(self, self.getColumnSorting());
        return $q.when(column);
      };
      Grid.prototype.renderingComplete = function() {
        if (angular.isFunction(this.options.onRegisterApi)) {
          this.options.onRegisterApi(this.api);
        }
        this.api.core.raise.renderingComplete(this.api);
      };
      Grid.prototype.createRowHashMap = function createRowHashMap() {
        var self = this;
        var hashMap = new RowHashMap();
        hashMap.grid = self;
        return hashMap;
      };
      Grid.prototype.refresh = function refresh(rowsAltered) {
        var self = this;
        var p1 = self.processRowsProcessors(self.rows).then(function(renderableRows) {
          self.setVisibleRows(renderableRows);
        });
        var p2 = self.processColumnsProcessors(self.columns).then(function(renderableColumns) {
          self.setVisibleColumns(renderableColumns);
        });
        return $q.all([p1, p2]).then(function() {
          self.redrawInPlace(rowsAltered);
          self.refreshCanvas(true);
        });
      };
      Grid.prototype.refreshRows = function refreshRows() {
        var self = this;
        return self.processRowsProcessors(self.rows).then(function(renderableRows) {
          self.setVisibleRows(renderableRows);
          self.redrawInPlace();
          self.refreshCanvas(true);
        });
      };
      Grid.prototype.refreshCanvas = function(buildStyles) {
        var self = this;
        if (buildStyles) {
          self.buildStyles();
        }
        var p = $q.defer();
        var containerHeadersToRecalc = [];
        for (var containerId in self.renderContainers) {
          if (self.renderContainers.hasOwnProperty(containerId)) {
            var container = self.renderContainers[containerId];
            if (container.canvasWidth === null || isNaN(container.canvasWidth)) {
              continue;
            }
            if (container.header || container.headerCanvas) {
              container.explicitHeaderHeight = container.explicitHeaderHeight || null;
              container.explicitHeaderCanvasHeight = container.explicitHeaderCanvasHeight || null;
              containerHeadersToRecalc.push(container);
            }
          }
        }
        if (containerHeadersToRecalc.length > 0) {
          if (buildStyles) {
            self.buildStyles();
          }
          $timeout(function() {
            var rebuildStyles = false;
            var maxHeaderHeight = 0;
            var maxHeaderCanvasHeight = 0;
            var i,
                container;
            var getHeight = function(oldVal, newVal) {
              if (oldVal !== newVal) {
                rebuildStyles = true;
              }
              return newVal;
            };
            for (i = 0; i < containerHeadersToRecalc.length; i++) {
              container = containerHeadersToRecalc[i];
              if (container.canvasWidth === null || isNaN(container.canvasWidth)) {
                continue;
              }
              if (container.header) {
                var headerHeight = container.headerHeight = getHeight(container.headerHeight, parseInt(gridUtil.outerElementHeight(container.header), 10));
                var topBorder = gridUtil.getBorderSize(container.header, 'top');
                var bottomBorder = gridUtil.getBorderSize(container.header, 'bottom');
                var innerHeaderHeight = parseInt(headerHeight - topBorder - bottomBorder, 10);
                innerHeaderHeight = innerHeaderHeight < 0 ? 0 : innerHeaderHeight;
                container.innerHeaderHeight = innerHeaderHeight;
                if (!container.explicitHeaderHeight && innerHeaderHeight > maxHeaderHeight) {
                  maxHeaderHeight = innerHeaderHeight;
                }
              }
              if (container.headerCanvas) {
                var headerCanvasHeight = container.headerCanvasHeight = getHeight(container.headerCanvasHeight, parseInt(gridUtil.outerElementHeight(container.headerCanvas), 10));
                if (!container.explicitHeaderCanvasHeight && headerCanvasHeight > maxHeaderCanvasHeight) {
                  maxHeaderCanvasHeight = headerCanvasHeight;
                }
              }
            }
            for (i = 0; i < containerHeadersToRecalc.length; i++) {
              container = containerHeadersToRecalc[i];
              if (maxHeaderHeight > 0 && typeof(container.headerHeight) !== 'undefined' && container.headerHeight !== null && (container.explicitHeaderHeight || container.headerHeight < maxHeaderHeight)) {
                container.explicitHeaderHeight = getHeight(container.explicitHeaderHeight, maxHeaderHeight);
              }
              if (maxHeaderCanvasHeight > 0 && typeof(container.headerCanvasHeight) !== 'undefined' && container.headerCanvasHeight !== null && (container.explicitHeaderCanvasHeight || container.headerCanvasHeight < maxHeaderCanvasHeight)) {
                container.explicitHeaderCanvasHeight = getHeight(container.explicitHeaderCanvasHeight, maxHeaderCanvasHeight);
              }
            }
            if (buildStyles && rebuildStyles) {
              self.buildStyles();
            }
            p.resolve();
          });
        } else {
          $timeout(function() {
            p.resolve();
          });
        }
        return p.promise;
      };
      Grid.prototype.redrawInPlace = function redrawInPlace(rowsAdded) {
        var self = this;
        for (var i in self.renderContainers) {
          var container = self.renderContainers[i];
          if (rowsAdded) {
            container.adjustRows(container.prevScrollTop, null);
            container.adjustColumns(container.prevScrollLeft, null);
          } else {
            container.adjustRows(null, container.prevScrolltopPercentage);
            container.adjustColumns(null, container.prevScrollleftPercentage);
          }
        }
      };
      Grid.prototype.hasLeftContainerColumns = function() {
        return this.hasLeftContainer() && this.renderContainers.left.renderedColumns.length > 0;
      };
      Grid.prototype.hasRightContainerColumns = function() {
        return this.hasRightContainer() && this.renderContainers.right.renderedColumns.length > 0;
      };
      Grid.prototype.scrollToIfNecessary = function(gridRow, gridCol) {
        var self = this;
        var scrollEvent = new ScrollEvent(self, 'uiGrid.scrollToIfNecessary');
        var visRowCache = self.renderContainers.body.visibleRowCache;
        var visColCache = self.renderContainers.body.visibleColumnCache;
        var topBound = self.renderContainers.body.prevScrollTop + self.headerHeight;
        topBound = (topBound < 0) ? 0 : topBound;
        var leftBound = self.renderContainers.body.prevScrollLeft;
        var bottomBound = self.renderContainers.body.prevScrollTop + self.gridHeight - self.renderContainers.body.headerHeight - self.footerHeight - self.scrollbarWidth;
        var rightBound = self.renderContainers.body.prevScrollLeft + Math.ceil(self.renderContainers.body.getViewportWidth());
        if (gridRow !== null) {
          var seekRowIndex = visRowCache.indexOf(gridRow);
          var scrollLength = (self.renderContainers.body.getCanvasHeight() - self.renderContainers.body.getViewportHeight());
          var pixelsToSeeRow = (seekRowIndex * self.options.rowHeight + self.headerHeight);
          pixelsToSeeRow = (pixelsToSeeRow < 0) ? 0 : pixelsToSeeRow;
          var scrollPixels,
              percentage;
          if (pixelsToSeeRow < topBound) {
            scrollPixels = self.renderContainers.body.prevScrollTop - (topBound - pixelsToSeeRow);
            percentage = scrollPixels / scrollLength;
            scrollEvent.y = {percentage: percentage};
          } else if (pixelsToSeeRow > bottomBound) {
            scrollPixels = pixelsToSeeRow - bottomBound + self.renderContainers.body.prevScrollTop;
            percentage = scrollPixels / scrollLength;
            scrollEvent.y = {percentage: percentage};
          }
        }
        if (gridCol !== null) {
          var seekColumnIndex = visColCache.indexOf(gridCol);
          var horizScrollLength = (self.renderContainers.body.getCanvasWidth() - self.renderContainers.body.getViewportWidth());
          var columnLeftEdge = 0;
          for (var i = 0; i < seekColumnIndex; i++) {
            var col = visColCache[i];
            columnLeftEdge += col.drawnWidth;
          }
          columnLeftEdge = (columnLeftEdge < 0) ? 0 : columnLeftEdge;
          var columnRightEdge = columnLeftEdge + gridCol.drawnWidth;
          columnRightEdge = (columnRightEdge < 0) ? 0 : columnRightEdge;
          var horizScrollPixels,
              horizPercentage;
          if (columnLeftEdge < leftBound) {
            horizScrollPixels = self.renderContainers.body.prevScrollLeft - (leftBound - columnLeftEdge);
            horizPercentage = horizScrollPixels / horizScrollLength;
            horizPercentage = (horizPercentage > 1) ? 1 : horizPercentage;
            scrollEvent.x = {percentage: horizPercentage};
          } else if (columnRightEdge > rightBound) {
            horizScrollPixels = columnRightEdge - rightBound + self.renderContainers.body.prevScrollLeft;
            horizPercentage = horizScrollPixels / horizScrollLength;
            horizPercentage = (horizPercentage > 1) ? 1 : horizPercentage;
            scrollEvent.x = {percentage: horizPercentage};
          }
        }
        var deferred = $q.defer();
        if (scrollEvent.y || scrollEvent.x) {
          scrollEvent.withDelay = false;
          self.scrollContainers('', scrollEvent);
          var dereg = self.api.core.on.scrollEnd(null, function() {
            deferred.resolve(scrollEvent);
            dereg();
          });
        } else {
          deferred.resolve();
        }
        return deferred.promise;
      };
      Grid.prototype.scrollTo = function(rowEntity, colDef) {
        var gridRow = null,
            gridCol = null;
        if (rowEntity !== null && typeof(rowEntity) !== 'undefined') {
          gridRow = this.getRow(rowEntity);
        }
        if (colDef !== null && typeof(colDef) !== 'undefined') {
          gridCol = this.getColumn(colDef.name ? colDef.name : colDef.field);
        }
        return this.scrollToIfNecessary(gridRow, gridCol);
      };
      Grid.prototype.clearAllFilters = function clearAllFilters(refreshRows, clearConditions, clearFlags) {
        if (refreshRows === undefined) {
          refreshRows = true;
        }
        if (clearConditions === undefined) {
          clearConditions = false;
        }
        if (clearFlags === undefined) {
          clearFlags = false;
        }
        this.columns.forEach(function(column) {
          column.filters.forEach(function(filter) {
            filter.term = undefined;
            if (clearConditions) {
              filter.condition = undefined;
            }
            if (clearFlags) {
              filter.flags = undefined;
            }
          });
        });
        if (refreshRows) {
          return this.refreshRows();
        }
      };
      function RowHashMap() {}
      RowHashMap.prototype = {
        put: function(key, value) {
          this[this.grid.options.rowIdentity(key)] = value;
        },
        get: function(key) {
          return this[this.grid.options.rowIdentity(key)];
        },
        remove: function(key) {
          var value = this[key = this.grid.options.rowIdentity(key)];
          delete this[key];
          return value;
        }
      };
      return Grid;
    }]);
  })();
  (function() {
    angular.module('ui.grid').factory('GridApi', ['$q', '$rootScope', 'gridUtil', 'uiGridConstants', 'GridRow', 'uiGridGridMenuService', function($q, $rootScope, gridUtil, uiGridConstants, GridRow, uiGridGridMenuService) {
      var GridApi = function GridApi(grid) {
        this.grid = grid;
        this.listeners = [];
        this.registerEvent('core', 'renderingComplete');
        this.registerEvent('core', 'filterChanged');
        this.registerMethod('core', 'setRowInvisible', GridRow.prototype.setRowInvisible);
        this.registerMethod('core', 'clearRowInvisible', GridRow.prototype.clearRowInvisible);
        this.registerMethod('core', 'getVisibleRows', this.grid.getVisibleRows);
        this.registerEvent('core', 'rowsVisibleChanged');
        this.registerEvent('core', 'rowsRendered');
        this.registerEvent('core', 'scrollBegin');
        this.registerEvent('core', 'scrollEnd');
        this.registerEvent('core', 'canvasHeightChanged');
      };
      GridApi.prototype.suppressEvents = function(listenerFuncs, callBackFn) {
        var self = this;
        var listeners = angular.isArray(listenerFuncs) ? listenerFuncs : [listenerFuncs];
        var foundListeners = self.listeners.filter(function(listener) {
          return listeners.some(function(l) {
            return listener.handler === l;
          });
        });
        foundListeners.forEach(function(l) {
          l.dereg();
        });
        callBackFn();
        foundListeners.forEach(function(l) {
          l.dereg = registerEventWithAngular(l.eventId, l.handler, self.grid, l._this);
        });
      };
      GridApi.prototype.registerEvent = function(featureName, eventName) {
        var self = this;
        if (!self[featureName]) {
          self[featureName] = {};
        }
        var feature = self[featureName];
        if (!feature.on) {
          feature.on = {};
          feature.raise = {};
        }
        var eventId = self.grid.id + featureName + eventName;
        feature.raise[eventName] = function() {
          $rootScope.$emit.apply($rootScope, [eventId].concat(Array.prototype.slice.call(arguments)));
        };
        feature.on[eventName] = function(scope, handler, _this) {
          if (scope !== null && typeof(scope.$on) === 'undefined') {
            gridUtil.logError('asked to listen on ' + featureName + '.on.' + eventName + ' but scope wasn\'t passed in the input parameters.  It is legitimate to pass null, but you\'ve passed something else, so you probably forgot to provide scope rather than did it deliberately, not registering');
            return;
          }
          var deregAngularOn = registerEventWithAngular(eventId, handler, self.grid, _this);
          var listener = {
            handler: handler,
            dereg: deregAngularOn,
            eventId: eventId,
            scope: scope,
            _this: _this
          };
          self.listeners.push(listener);
          var removeListener = function() {
            listener.dereg();
            var index = self.listeners.indexOf(listener);
            self.listeners.splice(index, 1);
          };
          if (scope) {
            scope.$on('$destroy', function() {
              removeListener();
            });
          }
          return removeListener;
        };
      };
      function registerEventWithAngular(eventId, handler, grid, _this) {
        return $rootScope.$on(eventId, function(event) {
          var args = Array.prototype.slice.call(arguments);
          args.splice(0, 1);
          handler.apply(_this ? _this : grid.api, args);
        });
      }
      GridApi.prototype.registerEventsFromObject = function(eventObjectMap) {
        var self = this;
        var features = [];
        angular.forEach(eventObjectMap, function(featProp, featPropName) {
          var feature = {
            name: featPropName,
            events: []
          };
          angular.forEach(featProp, function(prop, propName) {
            feature.events.push(propName);
          });
          features.push(feature);
        });
        features.forEach(function(feature) {
          feature.events.forEach(function(event) {
            self.registerEvent(feature.name, event);
          });
        });
      };
      GridApi.prototype.registerMethod = function(featureName, methodName, callBackFn, _this) {
        if (!this[featureName]) {
          this[featureName] = {};
        }
        var feature = this[featureName];
        feature[methodName] = gridUtil.createBoundedWrapper(_this || this.grid, callBackFn);
      };
      GridApi.prototype.registerMethodsFromObject = function(methodMap, _this) {
        var self = this;
        var features = [];
        angular.forEach(methodMap, function(featProp, featPropName) {
          var feature = {
            name: featPropName,
            methods: []
          };
          angular.forEach(featProp, function(prop, propName) {
            feature.methods.push({
              name: propName,
              fn: prop
            });
          });
          features.push(feature);
        });
        features.forEach(function(feature) {
          feature.methods.forEach(function(method) {
            self.registerMethod(feature.name, method.name, method.fn, _this);
          });
        });
      };
      return GridApi;
    }]);
  })();
  (function() {
    angular.module('ui.grid').factory('GridColumn', ['gridUtil', 'uiGridConstants', 'i18nService', function(gridUtil, uiGridConstants, i18nService) {
      function GridColumn(colDef, uid, grid) {
        var self = this;
        self.grid = grid;
        self.uid = uid;
        self.updateColumnDef(colDef, true);
        self.aggregationValue = undefined;
        self.updateAggregationValue = function() {
          if (!self.aggregationType) {
            self.aggregationValue = undefined;
            return;
          }
          var result = 0;
          var visibleRows = self.grid.getVisibleRows();
          var cellValues = function() {
            var values = [];
            visibleRows.forEach(function(row) {
              var cellValue = self.grid.getCellValue(row, self);
              var cellNumber = Number(cellValue);
              if (!isNaN(cellNumber)) {
                values.push(cellNumber);
              }
            });
            return values;
          };
          if (angular.isFunction(self.aggregationType)) {
            self.aggregationValue = self.aggregationType(visibleRows, self);
          } else if (self.aggregationType === uiGridConstants.aggregationTypes.count) {
            self.aggregationValue = self.grid.getVisibleRowCount();
          } else if (self.aggregationType === uiGridConstants.aggregationTypes.sum) {
            cellValues().forEach(function(value) {
              result += value;
            });
            self.aggregationValue = result;
          } else if (self.aggregationType === uiGridConstants.aggregationTypes.avg) {
            cellValues().forEach(function(value) {
              result += value;
            });
            result = result / cellValues().length;
            self.aggregationValue = result;
          } else if (self.aggregationType === uiGridConstants.aggregationTypes.min) {
            self.aggregationValue = Math.min.apply(null, cellValues());
          } else if (self.aggregationType === uiGridConstants.aggregationTypes.max) {
            self.aggregationValue = Math.max.apply(null, cellValues());
          } else {
            self.aggregationValue = '\u00A0';
          }
        };
        this.getAggregationValue = function() {
          return self.aggregationValue;
        };
      }
      GridColumn.prototype.hideColumn = function() {
        this.colDef.visible = false;
      };
      GridColumn.prototype.setPropertyOrDefault = function(colDef, propName, defaultValue) {
        var self = this;
        if (typeof(colDef[propName]) !== 'undefined' && colDef[propName]) {
          self[propName] = colDef[propName];
        } else if (typeof(self[propName]) !== 'undefined') {
          self[propName] = self[propName];
        } else {
          self[propName] = defaultValue ? defaultValue : {};
        }
      };
      GridColumn.prototype.updateColumnDef = function(colDef, isNew) {
        var self = this;
        self.colDef = colDef;
        if (colDef.name === undefined) {
          throw new Error('colDef.name is required for column at index ' + self.grid.options.columnDefs.indexOf(colDef));
        }
        self.displayName = (colDef.displayName === undefined) ? gridUtil.readableColumnName(colDef.name) : colDef.displayName;
        if (!angular.isNumber(self.width) || !self.hasCustomWidth || colDef.allowCustomWidthOverride) {
          var colDefWidth = colDef.width;
          var parseErrorMsg = "Cannot parse column width '" + colDefWidth + "' for column named '" + colDef.name + "'";
          self.hasCustomWidth = false;
          if (!angular.isString(colDefWidth) && !angular.isNumber(colDefWidth)) {
            self.width = '*';
          } else if (angular.isString(colDefWidth)) {
            if (gridUtil.endsWith(colDefWidth, '%')) {
              var percentStr = colDefWidth.replace(/%/g, '');
              var percent = parseInt(percentStr, 10);
              if (isNaN(percent)) {
                throw new Error(parseErrorMsg);
              }
              self.width = colDefWidth;
            } else if (colDefWidth.match(/^(\d+)$/)) {
              self.width = parseInt(colDefWidth.match(/^(\d+)$/)[1], 10);
            } else if (colDefWidth.match(/^\*+$/)) {
              self.width = colDefWidth;
            } else {
              throw new Error(parseErrorMsg);
            }
          } else {
            self.width = colDefWidth;
          }
        }
        ['minWidth', 'maxWidth'].forEach(function(name) {
          var minOrMaxWidth = colDef[name];
          var parseErrorMsg = "Cannot parse column " + name + " '" + minOrMaxWidth + "' for column named '" + colDef.name + "'";
          if (!angular.isString(minOrMaxWidth) && !angular.isNumber(minOrMaxWidth)) {
            self[name] = ((name === 'minWidth') ? 30 : 9000);
          } else if (angular.isString(minOrMaxWidth)) {
            if (minOrMaxWidth.match(/^(\d+)$/)) {
              self[name] = parseInt(minOrMaxWidth.match(/^(\d+)$/)[1], 10);
            } else {
              throw new Error(parseErrorMsg);
            }
          } else {
            self[name] = minOrMaxWidth;
          }
        });
        self.field = (colDef.field === undefined) ? colDef.name : colDef.field;
        if (typeof(self.field) !== 'string') {
          gridUtil.logError('Field is not a string, this is likely to break the code, Field is: ' + self.field);
        }
        self.name = colDef.name;
        self.displayName = (colDef.displayName === undefined) ? gridUtil.readableColumnName(colDef.name) : colDef.displayName;
        self.aggregationType = angular.isDefined(colDef.aggregationType) ? colDef.aggregationType : null;
        self.footerCellTemplate = angular.isDefined(colDef.footerCellTemplate) ? colDef.footerCellTemplate : null;
        if (typeof(colDef.cellTooltip) === 'undefined' || colDef.cellTooltip === false) {
          self.cellTooltip = false;
        } else if (colDef.cellTooltip === true) {
          self.cellTooltip = function(row, col) {
            return self.grid.getCellValue(row, col);
          };
        } else if (typeof(colDef.cellTooltip) === 'function') {
          self.cellTooltip = colDef.cellTooltip;
        } else {
          self.cellTooltip = function(row, col) {
            return col.colDef.cellTooltip;
          };
        }
        if (typeof(colDef.headerTooltip) === 'undefined' || colDef.headerTooltip === false) {
          self.headerTooltip = false;
        } else if (colDef.headerTooltip === true) {
          self.headerTooltip = function(col) {
            return col.displayName;
          };
        } else if (typeof(colDef.headerTooltip) === 'function') {
          self.headerTooltip = colDef.headerTooltip;
        } else {
          self.headerTooltip = function(col) {
            return col.colDef.headerTooltip;
          };
        }
        self.footerCellClass = colDef.footerCellClass;
        self.cellClass = colDef.cellClass;
        self.headerCellClass = colDef.headerCellClass;
        self.cellFilter = colDef.cellFilter ? colDef.cellFilter : "";
        self.sortCellFiltered = colDef.sortCellFiltered ? true : false;
        self.filterCellFiltered = colDef.filterCellFiltered ? true : false;
        self.headerCellFilter = colDef.headerCellFilter ? colDef.headerCellFilter : "";
        self.footerCellFilter = colDef.footerCellFilter ? colDef.footerCellFilter : "";
        self.visible = gridUtil.isNullOrUndefined(colDef.visible) || colDef.visible;
        self.headerClass = colDef.headerClass;
        self.enableSorting = typeof(colDef.enableSorting) !== 'undefined' ? colDef.enableSorting : true;
        self.sortingAlgorithm = colDef.sortingAlgorithm;
        self.sortDirectionCycle = typeof(colDef.sortDirectionCycle) !== 'undefined' ? colDef.sortDirectionCycle : [null, uiGridConstants.ASC, uiGridConstants.DESC];
        if (typeof(self.suppressRemoveSort) === 'undefined') {
          self.suppressRemoveSort = typeof(colDef.suppressRemoveSort) !== 'undefined' ? colDef.suppressRemoveSort : false;
        }
        self.enableFiltering = typeof(colDef.enableFiltering) !== 'undefined' ? colDef.enableFiltering : true;
        self.setPropertyOrDefault(colDef, 'menuItems', []);
        if (isNew) {
          self.setPropertyOrDefault(colDef, 'sort');
        }
        var defaultFilters = [];
        if (colDef.filter) {
          defaultFilters.push(colDef.filter);
        } else if (colDef.filters) {
          defaultFilters = colDef.filters;
        } else {
          defaultFilters.push({});
        }
        if (isNew) {
          self.setPropertyOrDefault(colDef, 'filter');
          self.setPropertyOrDefault(colDef, 'filters', defaultFilters);
        } else if (self.filters.length === defaultFilters.length) {
          self.filters.forEach(function(filter, index) {
            if (typeof(defaultFilters[index].placeholder) !== 'undefined') {
              filter.placeholder = defaultFilters[index].placeholder;
            }
            if (typeof(defaultFilters[index].ariaLabel) !== 'undefined') {
              filter.ariaLabel = defaultFilters[index].ariaLabel;
            }
            if (typeof(defaultFilters[index].flags) !== 'undefined') {
              filter.flags = defaultFilters[index].flags;
            }
            if (typeof(defaultFilters[index].type) !== 'undefined') {
              filter.type = defaultFilters[index].type;
            }
            if (typeof(defaultFilters[index].selectOptions) !== 'undefined') {
              filter.selectOptions = defaultFilters[index].selectOptions;
            }
          });
        }
      };
      GridColumn.prototype.unsort = function() {
        this.sort = {};
        this.grid.api.core.raise.sortChanged(this.grid, this.grid.getColumnSorting());
      };
      GridColumn.prototype.getColClass = function(prefixDot) {
        var cls = uiGridConstants.COL_CLASS_PREFIX + this.uid;
        return prefixDot ? '.' + cls : cls;
      };
      GridColumn.prototype.isPinnedLeft = function() {
        return this.renderContainer === 'left';
      };
      GridColumn.prototype.isPinnedRight = function() {
        return this.renderContainer === 'right';
      };
      GridColumn.prototype.getColClassDefinition = function() {
        return ' .grid' + this.grid.id + ' ' + this.getColClass(true) + ' { min-width: ' + this.drawnWidth + 'px; max-width: ' + this.drawnWidth + 'px; }';
      };
      GridColumn.prototype.getRenderContainer = function getRenderContainer() {
        var self = this;
        var containerId = self.renderContainer;
        if (containerId === null || containerId === '' || containerId === undefined) {
          containerId = 'body';
        }
        return self.grid.renderContainers[containerId];
      };
      GridColumn.prototype.showColumn = function() {
        this.colDef.visible = true;
      };
      GridColumn.prototype.getAggregationText = function() {
        var self = this;
        if (self.colDef.aggregationHideLabel) {
          return '';
        } else if (self.colDef.aggregationLabel) {
          return self.colDef.aggregationLabel;
        } else {
          switch (self.colDef.aggregationType) {
            case uiGridConstants.aggregationTypes.count:
              return i18nService.getSafeText('aggregation.count');
            case uiGridConstants.aggregationTypes.sum:
              return i18nService.getSafeText('aggregation.sum');
            case uiGridConstants.aggregationTypes.avg:
              return i18nService.getSafeText('aggregation.avg');
            case uiGridConstants.aggregationTypes.min:
              return i18nService.getSafeText('aggregation.min');
            case uiGridConstants.aggregationTypes.max:
              return i18nService.getSafeText('aggregation.max');
            default:
              return '';
          }
        }
      };
      GridColumn.prototype.getCellTemplate = function() {
        var self = this;
        return self.cellTemplatePromise;
      };
      GridColumn.prototype.getCompiledElementFn = function() {
        var self = this;
        return self.compiledElementFnDefer.promise;
      };
      return GridColumn;
    }]);
  })();
  (function() {
    angular.module('ui.grid').factory('GridOptions', ['gridUtil', 'uiGridConstants', function(gridUtil, uiGridConstants) {
      return {initialize: function(baseOptions) {
          baseOptions.onRegisterApi = baseOptions.onRegisterApi || angular.noop();
          baseOptions.data = baseOptions.data || [];
          baseOptions.columnDefs = baseOptions.columnDefs || [];
          baseOptions.excludeProperties = baseOptions.excludeProperties || ['$$hashKey'];
          baseOptions.enableRowHashing = baseOptions.enableRowHashing !== false;
          baseOptions.rowIdentity = baseOptions.rowIdentity || function rowIdentity(row) {
            return gridUtil.hashKey(row);
          };
          baseOptions.getRowIdentity = baseOptions.getRowIdentity || function getRowIdentity(row) {
            return row.$$hashKey;
          };
          baseOptions.flatEntityAccess = baseOptions.flatEntityAccess === true;
          baseOptions.showHeader = typeof(baseOptions.showHeader) !== "undefined" ? baseOptions.showHeader : true;
          if (!baseOptions.showHeader) {
            baseOptions.headerRowHeight = 0;
          } else {
            baseOptions.headerRowHeight = typeof(baseOptions.headerRowHeight) !== "undefined" ? baseOptions.headerRowHeight : 30;
          }
          baseOptions.rowHeight = baseOptions.rowHeight || 30;
          baseOptions.minRowsToShow = typeof(baseOptions.minRowsToShow) !== "undefined" ? baseOptions.minRowsToShow : 10;
          baseOptions.showGridFooter = baseOptions.showGridFooter === true;
          baseOptions.showColumnFooter = baseOptions.showColumnFooter === true;
          baseOptions.columnFooterHeight = typeof(baseOptions.columnFooterHeight) !== "undefined" ? baseOptions.columnFooterHeight : 30;
          baseOptions.gridFooterHeight = typeof(baseOptions.gridFooterHeight) !== "undefined" ? baseOptions.gridFooterHeight : 30;
          baseOptions.columnWidth = typeof(baseOptions.columnWidth) !== "undefined" ? baseOptions.columnWidth : 50;
          baseOptions.maxVisibleColumnCount = typeof(baseOptions.maxVisibleColumnCount) !== "undefined" ? baseOptions.maxVisibleColumnCount : 200;
          baseOptions.virtualizationThreshold = typeof(baseOptions.virtualizationThreshold) !== "undefined" ? baseOptions.virtualizationThreshold : 20;
          baseOptions.columnVirtualizationThreshold = typeof(baseOptions.columnVirtualizationThreshold) !== "undefined" ? baseOptions.columnVirtualizationThreshold : 10;
          baseOptions.excessRows = typeof(baseOptions.excessRows) !== "undefined" ? baseOptions.excessRows : 4;
          baseOptions.scrollThreshold = typeof(baseOptions.scrollThreshold) !== "undefined" ? baseOptions.scrollThreshold : 4;
          baseOptions.excessColumns = typeof(baseOptions.excessColumns) !== "undefined" ? baseOptions.excessColumns : 4;
          baseOptions.horizontalScrollThreshold = typeof(baseOptions.horizontalScrollThreshold) !== "undefined" ? baseOptions.horizontalScrollThreshold : 2;
          baseOptions.aggregationCalcThrottle = typeof(baseOptions.aggregationCalcThrottle) !== "undefined" ? baseOptions.aggregationCalcThrottle : 500;
          baseOptions.wheelScrollThrottle = typeof(baseOptions.wheelScrollThrottle) !== "undefined" ? baseOptions.wheelScrollThrottle : 70;
          baseOptions.scrollDebounce = typeof(baseOptions.scrollDebounce) !== "undefined" ? baseOptions.scrollDebounce : 300;
          baseOptions.enableSorting = baseOptions.enableSorting !== false;
          baseOptions.enableFiltering = baseOptions.enableFiltering === true;
          baseOptions.enableColumnMenus = baseOptions.enableColumnMenus !== false;
          baseOptions.enableVerticalScrollbar = typeof(baseOptions.enableVerticalScrollbar) !== "undefined" ? baseOptions.enableVerticalScrollbar : uiGridConstants.scrollbars.ALWAYS;
          baseOptions.enableHorizontalScrollbar = typeof(baseOptions.enableHorizontalScrollbar) !== "undefined" ? baseOptions.enableHorizontalScrollbar : uiGridConstants.scrollbars.ALWAYS;
          baseOptions.enableMinHeightCheck = baseOptions.enableMinHeightCheck !== false;
          baseOptions.minimumColumnSize = typeof(baseOptions.minimumColumnSize) !== "undefined" ? baseOptions.minimumColumnSize : 10;
          baseOptions.rowEquality = baseOptions.rowEquality || function(entityA, entityB) {
            return entityA === entityB;
          };
          baseOptions.headerTemplate = baseOptions.headerTemplate || null;
          baseOptions.footerTemplate = baseOptions.footerTemplate || 'ui-grid/ui-grid-footer';
          baseOptions.gridFooterTemplate = baseOptions.gridFooterTemplate || 'ui-grid/ui-grid-grid-footer';
          baseOptions.rowTemplate = baseOptions.rowTemplate || 'ui-grid/ui-grid-row';
          baseOptions.appScopeProvider = baseOptions.appScopeProvider || null;
          return baseOptions;
        }};
    }]);
  })();
  (function() {
    angular.module('ui.grid').factory('GridRenderContainer', ['gridUtil', 'uiGridConstants', function(gridUtil, uiGridConstants) {
      function GridRenderContainer(name, grid, options) {
        var self = this;
        self.name = name;
        self.grid = grid;
        self.visibleRowCache = [];
        self.visibleColumnCache = [];
        self.renderedRows = [];
        self.renderedColumns = [];
        self.prevScrollTop = 0;
        self.prevScrolltopPercentage = 0;
        self.prevRowScrollIndex = 0;
        self.prevScrollLeft = 0;
        self.prevScrollleftPercentage = 0;
        self.prevColumnScrollIndex = 0;
        self.columnStyles = "";
        self.viewportAdjusters = [];
        self.hasHScrollbar = false;
        self.hasVScrollbar = false;
        self.canvasHeightShouldUpdate = true;
        self.$$canvasHeight = 0;
        if (options && angular.isObject(options)) {
          angular.extend(self, options);
        }
        grid.registerStyleComputation({
          priority: 5,
          func: function() {
            self.updateColumnWidths();
            return self.columnStyles;
          }
        });
      }
      GridRenderContainer.prototype.reset = function reset() {
        this.visibleColumnCache.length = 0;
        this.visibleRowCache.length = 0;
        this.renderedRows.length = 0;
        this.renderedColumns.length = 0;
      };
      GridRenderContainer.prototype.containsColumn = function(col) {
        return this.visibleColumnCache.indexOf(col) !== -1;
      };
      GridRenderContainer.prototype.minRowsToRender = function minRowsToRender() {
        var self = this;
        var minRows = 0;
        var rowAddedHeight = 0;
        var viewPortHeight = self.getViewportHeight();
        for (var i = self.visibleRowCache.length - 1; rowAddedHeight < viewPortHeight && i >= 0; i--) {
          rowAddedHeight += self.visibleRowCache[i].height;
          minRows++;
        }
        return minRows;
      };
      GridRenderContainer.prototype.minColumnsToRender = function minColumnsToRender() {
        var self = this;
        var viewportWidth = this.getViewportWidth();
        var min = 0;
        var totalWidth = 0;
        for (var i = 0; i < self.visibleColumnCache.length; i++) {
          var col = self.visibleColumnCache[i];
          if (totalWidth < viewportWidth) {
            totalWidth += col.drawnWidth ? col.drawnWidth : 0;
            min++;
          } else {
            var currWidth = 0;
            for (var j = i; j >= i - min; j--) {
              currWidth += self.visibleColumnCache[j].drawnWidth ? self.visibleColumnCache[j].drawnWidth : 0;
            }
            if (currWidth < viewportWidth) {
              min++;
            }
          }
        }
        return min;
      };
      GridRenderContainer.prototype.getVisibleRowCount = function getVisibleRowCount() {
        return this.visibleRowCache.length;
      };
      GridRenderContainer.prototype.registerViewportAdjuster = function registerViewportAdjuster(func) {
        this.viewportAdjusters.push(func);
      };
      GridRenderContainer.prototype.removeViewportAdjuster = function removeViewportAdjuster(func) {
        var idx = this.viewportAdjusters.indexOf(func);
        if (idx > -1) {
          this.viewportAdjusters.splice(idx, 1);
        }
      };
      GridRenderContainer.prototype.getViewportAdjustment = function getViewportAdjustment() {
        var self = this;
        var adjustment = {
          height: 0,
          width: 0
        };
        self.viewportAdjusters.forEach(function(func) {
          adjustment = func.call(this, adjustment);
        });
        return adjustment;
      };
      GridRenderContainer.prototype.getMargin = function getMargin(side) {
        var self = this;
        var amount = 0;
        self.viewportAdjusters.forEach(function(func) {
          var adjustment = func.call(this, {
            height: 0,
            width: 0
          });
          if (adjustment.side && adjustment.side === side) {
            amount += adjustment.width * -1;
          }
        });
        return amount;
      };
      GridRenderContainer.prototype.getViewportHeight = function getViewportHeight() {
        var self = this;
        var headerHeight = (self.headerHeight) ? self.headerHeight : self.grid.headerHeight;
        var viewPortHeight = self.grid.gridHeight - headerHeight - self.grid.footerHeight;
        var adjustment = self.getViewportAdjustment();
        viewPortHeight = viewPortHeight + adjustment.height;
        return viewPortHeight;
      };
      GridRenderContainer.prototype.getViewportWidth = function getViewportWidth() {
        var self = this;
        var viewportWidth = self.grid.gridWidth;
        var adjustment = self.getViewportAdjustment();
        viewportWidth = viewportWidth + adjustment.width;
        return viewportWidth;
      };
      GridRenderContainer.prototype.getHeaderViewportWidth = function getHeaderViewportWidth() {
        var self = this;
        var viewportWidth = this.getViewportWidth();
        return viewportWidth;
      };
      GridRenderContainer.prototype.getCanvasHeight = function getCanvasHeight() {
        var self = this;
        if (!self.canvasHeightShouldUpdate) {
          return self.$$canvasHeight;
        }
        var oldCanvasHeight = self.$$canvasHeight;
        self.$$canvasHeight = 0;
        self.visibleRowCache.forEach(function(row) {
          self.$$canvasHeight += row.height;
        });
        self.canvasHeightShouldUpdate = false;
        self.grid.api.core.raise.canvasHeightChanged(oldCanvasHeight, self.$$canvasHeight);
        return self.$$canvasHeight;
      };
      GridRenderContainer.prototype.getVerticalScrollLength = function getVerticalScrollLength() {
        return this.getCanvasHeight() - this.getViewportHeight() + this.grid.scrollbarHeight;
      };
      GridRenderContainer.prototype.getCanvasWidth = function getCanvasWidth() {
        var self = this;
        var ret = self.canvasWidth;
        return ret;
      };
      GridRenderContainer.prototype.setRenderedRows = function setRenderedRows(newRows) {
        this.renderedRows.length = newRows.length;
        for (var i = 0; i < newRows.length; i++) {
          this.renderedRows[i] = newRows[i];
        }
      };
      GridRenderContainer.prototype.setRenderedColumns = function setRenderedColumns(newColumns) {
        var self = this;
        this.renderedColumns.length = newColumns.length;
        for (var i = 0; i < newColumns.length; i++) {
          this.renderedColumns[i] = newColumns[i];
        }
        this.updateColumnOffset();
      };
      GridRenderContainer.prototype.updateColumnOffset = function updateColumnOffset() {
        var hiddenColumnsWidth = 0;
        for (var i = 0; i < this.currentFirstColumn; i++) {
          hiddenColumnsWidth += this.visibleColumnCache[i].drawnWidth;
        }
        this.columnOffset = hiddenColumnsWidth;
      };
      GridRenderContainer.prototype.scrollVertical = function(newScrollTop) {
        var vertScrollPercentage = -1;
        if (newScrollTop !== this.prevScrollTop) {
          var yDiff = newScrollTop - this.prevScrollTop;
          if (yDiff > 0) {
            this.grid.scrollDirection = uiGridConstants.scrollDirection.DOWN;
          }
          if (yDiff < 0) {
            this.grid.scrollDirection = uiGridConstants.scrollDirection.UP;
          }
          var vertScrollLength = this.getVerticalScrollLength();
          vertScrollPercentage = newScrollTop / vertScrollLength;
          if (vertScrollPercentage > 1) {
            vertScrollPercentage = 1;
          }
          if (vertScrollPercentage < 0) {
            vertScrollPercentage = 0;
          }
          this.adjustScrollVertical(newScrollTop, vertScrollPercentage);
          return vertScrollPercentage;
        }
      };
      GridRenderContainer.prototype.scrollHorizontal = function(newScrollLeft) {
        var horizScrollPercentage = -1;
        if (newScrollLeft !== this.prevScrollLeft) {
          var xDiff = newScrollLeft - this.prevScrollLeft;
          if (xDiff > 0) {
            this.grid.scrollDirection = uiGridConstants.scrollDirection.RIGHT;
          }
          if (xDiff < 0) {
            this.grid.scrollDirection = uiGridConstants.scrollDirection.LEFT;
          }
          var horizScrollLength = (this.canvasWidth - this.getViewportWidth());
          if (horizScrollLength !== 0) {
            horizScrollPercentage = newScrollLeft / horizScrollLength;
          } else {
            horizScrollPercentage = 0;
          }
          this.adjustScrollHorizontal(newScrollLeft, horizScrollPercentage);
          return horizScrollPercentage;
        }
      };
      GridRenderContainer.prototype.adjustScrollVertical = function adjustScrollVertical(scrollTop, scrollPercentage, force) {
        if (this.prevScrollTop === scrollTop && !force) {
          return;
        }
        if (typeof(scrollTop) === 'undefined' || scrollTop === undefined || scrollTop === null) {
          scrollTop = (this.getCanvasHeight() - this.getViewportHeight()) * scrollPercentage;
        }
        this.adjustRows(scrollTop, scrollPercentage, false);
        this.prevScrollTop = scrollTop;
        this.prevScrolltopPercentage = scrollPercentage;
        this.grid.queueRefresh();
      };
      GridRenderContainer.prototype.adjustScrollHorizontal = function adjustScrollHorizontal(scrollLeft, scrollPercentage, force) {
        if (this.prevScrollLeft === scrollLeft && !force) {
          return;
        }
        if (typeof(scrollLeft) === 'undefined' || scrollLeft === undefined || scrollLeft === null) {
          scrollLeft = (this.getCanvasWidth() - this.getViewportWidth()) * scrollPercentage;
        }
        this.adjustColumns(scrollLeft, scrollPercentage);
        this.prevScrollLeft = scrollLeft;
        this.prevScrollleftPercentage = scrollPercentage;
        this.grid.queueRefresh();
      };
      GridRenderContainer.prototype.adjustRows = function adjustRows(scrollTop, scrollPercentage, postDataLoaded) {
        var self = this;
        var minRows = self.minRowsToRender();
        var rowCache = self.visibleRowCache;
        var maxRowIndex = rowCache.length - minRows;
        if ((typeof(scrollPercentage) === 'undefined' || scrollPercentage === null) && scrollTop) {
          scrollPercentage = scrollTop / self.getVerticalScrollLength();
        }
        var rowIndex = Math.ceil(Math.min(maxRowIndex, maxRowIndex * scrollPercentage));
        if (rowIndex > maxRowIndex) {
          rowIndex = maxRowIndex;
        }
        var newRange = [];
        if (rowCache.length > self.grid.options.virtualizationThreshold) {
          if (!(typeof(scrollTop) === 'undefined' || scrollTop === null)) {
            if (!self.grid.suppressParentScrollDown && self.prevScrollTop < scrollTop && rowIndex < self.prevRowScrollIndex + self.grid.options.scrollThreshold && rowIndex < maxRowIndex) {
              return;
            }
            if (!self.grid.suppressParentScrollUp && self.prevScrollTop > scrollTop && rowIndex > self.prevRowScrollIndex - self.grid.options.scrollThreshold && rowIndex < maxRowIndex) {
              return;
            }
          }
          var rangeStart = {};
          var rangeEnd = {};
          rangeStart = Math.max(0, rowIndex - self.grid.options.excessRows);
          rangeEnd = Math.min(rowCache.length, rowIndex + minRows + self.grid.options.excessRows);
          newRange = [rangeStart, rangeEnd];
        } else {
          var maxLen = self.visibleRowCache.length;
          newRange = [0, Math.max(maxLen, minRows + self.grid.options.excessRows)];
        }
        self.updateViewableRowRange(newRange);
        self.prevRowScrollIndex = rowIndex;
      };
      GridRenderContainer.prototype.adjustColumns = function adjustColumns(scrollLeft, scrollPercentage) {
        var self = this;
        var minCols = self.minColumnsToRender();
        var columnCache = self.visibleColumnCache;
        var maxColumnIndex = columnCache.length - minCols;
        if ((typeof(scrollPercentage) === 'undefined' || scrollPercentage === null) && scrollLeft) {
          var horizScrollLength = (self.getCanvasWidth() - self.getViewportWidth());
          scrollPercentage = scrollLeft / horizScrollLength;
        }
        var colIndex = Math.ceil(Math.min(maxColumnIndex, maxColumnIndex * scrollPercentage));
        if (colIndex > maxColumnIndex) {
          colIndex = maxColumnIndex;
        }
        var newRange = [];
        if (columnCache.length > self.grid.options.columnVirtualizationThreshold && self.getCanvasWidth() > self.getViewportWidth()) {
          var rangeStart = Math.max(0, colIndex - self.grid.options.excessColumns);
          var rangeEnd = Math.min(columnCache.length, colIndex + minCols + self.grid.options.excessColumns);
          newRange = [rangeStart, rangeEnd];
        } else {
          var maxLen = self.visibleColumnCache.length;
          newRange = [0, Math.max(maxLen, minCols + self.grid.options.excessColumns)];
        }
        self.updateViewableColumnRange(newRange);
        self.prevColumnScrollIndex = colIndex;
      };
      GridRenderContainer.prototype.updateViewableRowRange = function updateViewableRowRange(renderedRange) {
        var rowArr = this.visibleRowCache.slice(renderedRange[0], renderedRange[1]);
        this.currentTopRow = renderedRange[0];
        this.setRenderedRows(rowArr);
      };
      GridRenderContainer.prototype.updateViewableColumnRange = function updateViewableColumnRange(renderedRange) {
        var columnArr = this.visibleColumnCache.slice(renderedRange[0], renderedRange[1]);
        this.currentFirstColumn = renderedRange[0];
        this.setRenderedColumns(columnArr);
      };
      GridRenderContainer.prototype.headerCellWrapperStyle = function() {
        var self = this;
        if (self.currentFirstColumn !== 0) {
          var offset = self.columnOffset;
          if (self.grid.isRTL()) {
            return {'margin-right': offset + 'px'};
          } else {
            return {'margin-left': offset + 'px'};
          }
        }
        return null;
      };
      GridRenderContainer.prototype.updateColumnWidths = function() {
        var self = this;
        var asterisksArray = [],
            asteriskNum = 0,
            usedWidthSum = 0,
            ret = '';
        var availableWidth = self.grid.getViewportWidth() - self.grid.scrollbarWidth;
        var columnCache = [];
        angular.forEach(self.grid.renderContainers, function(container, name) {
          columnCache = columnCache.concat(container.visibleColumnCache);
        });
        columnCache.forEach(function(column, i) {
          var width = 0;
          if (!column.visible) {
            return;
          }
          if (angular.isNumber(column.width)) {
            width = parseInt(column.width, 10);
            usedWidthSum = usedWidthSum + width;
            column.drawnWidth = width;
          } else if (gridUtil.endsWith(column.width, "%")) {
            width = parseInt(parseInt(column.width.replace(/%/g, ''), 10) / 100 * availableWidth);
            if (width > column.maxWidth) {
              width = column.maxWidth;
            }
            if (width < column.minWidth) {
              width = column.minWidth;
            }
            usedWidthSum = usedWidthSum + width;
            column.drawnWidth = width;
          } else if (angular.isString(column.width) && column.width.indexOf('*') !== -1) {
            asteriskNum = asteriskNum + column.width.length;
            asterisksArray.push(column);
          }
        });
        var remainingWidth = availableWidth - usedWidthSum;
        var i,
            column,
            colWidth;
        if (asterisksArray.length > 0) {
          var asteriskVal = remainingWidth / asteriskNum;
          asterisksArray.forEach(function(column) {
            var width = parseInt(column.width.length * asteriskVal, 10);
            if (width > column.maxWidth) {
              width = column.maxWidth;
            }
            if (width < column.minWidth) {
              width = column.minWidth;
            }
            usedWidthSum = usedWidthSum + width;
            column.drawnWidth = width;
          });
        }
        var processColumnUpwards = function(column) {
          if (column.drawnWidth < column.maxWidth && leftoverWidth > 0) {
            column.drawnWidth++;
            usedWidthSum++;
            leftoverWidth--;
            columnsToChange = true;
          }
        };
        var leftoverWidth = availableWidth - usedWidthSum;
        var columnsToChange = true;
        while (leftoverWidth > 0 && columnsToChange) {
          columnsToChange = false;
          asterisksArray.forEach(processColumnUpwards);
        }
        var processColumnDownwards = function(column) {
          if (column.drawnWidth > column.minWidth && excessWidth > 0) {
            column.drawnWidth--;
            usedWidthSum--;
            excessWidth--;
            columnsToChange = true;
          }
        };
        var excessWidth = usedWidthSum - availableWidth;
        columnsToChange = true;
        while (excessWidth > 0 && columnsToChange) {
          columnsToChange = false;
          asterisksArray.forEach(processColumnDownwards);
        }
        var canvasWidth = 0;
        self.visibleColumnCache.forEach(function(column) {
          if (column.visible) {
            canvasWidth = canvasWidth + column.drawnWidth;
          }
        });
        columnCache.forEach(function(column) {
          ret = ret + column.getColClassDefinition();
        });
        self.canvasWidth = canvasWidth;
        this.columnStyles = ret;
      };
      GridRenderContainer.prototype.needsHScrollbarPlaceholder = function() {
        return this.grid.options.enableHorizontalScrollbar && !this.hasHScrollbar && !this.grid.disableScrolling;
      };
      GridRenderContainer.prototype.getViewportStyle = function() {
        var self = this;
        var styles = {};
        self.hasHScrollbar = false;
        self.hasVScrollbar = false;
        if (self.grid.disableScrolling) {
          styles['overflow-x'] = 'hidden';
          styles['overflow-y'] = 'hidden';
          return styles;
        }
        if (self.name === 'body') {
          self.hasHScrollbar = self.grid.options.enableHorizontalScrollbar !== uiGridConstants.scrollbars.NEVER;
          if (!self.grid.isRTL()) {
            if (!self.grid.hasRightContainerColumns()) {
              self.hasVScrollbar = self.grid.options.enableVerticalScrollbar !== uiGridConstants.scrollbars.NEVER;
            }
          } else {
            if (!self.grid.hasLeftContainerColumns()) {
              self.hasVScrollbar = self.grid.options.enableVerticalScrollbar !== uiGridConstants.scrollbars.NEVER;
            }
          }
        } else if (self.name === 'left') {
          self.hasVScrollbar = self.grid.isRTL() ? self.grid.options.enableVerticalScrollbar !== uiGridConstants.scrollbars.NEVER : false;
        } else {
          self.hasVScrollbar = !self.grid.isRTL() ? self.grid.options.enableVerticalScrollbar !== uiGridConstants.scrollbars.NEVER : false;
        }
        styles['overflow-x'] = self.hasHScrollbar ? 'scroll' : 'hidden';
        styles['overflow-y'] = self.hasVScrollbar ? 'scroll' : 'hidden';
        return styles;
      };
      return GridRenderContainer;
    }]);
  })();
  (function() {
    angular.module('ui.grid').factory('GridRow', ['gridUtil', function(gridUtil) {
      function GridRow(entity, index, grid) {
        this.grid = grid;
        this.entity = entity;
        this.uid = gridUtil.nextUid();
        this.visible = true;
        this.$$height = grid.options.rowHeight;
      }
      Object.defineProperty(GridRow.prototype, 'height', {
        get: function() {
          return this.$$height;
        },
        set: function(height) {
          if (height !== this.$$height) {
            this.grid.updateCanvasHeight();
            this.$$height = height;
          }
        }
      });
      GridRow.prototype.getQualifiedColField = function(col) {
        return 'row.' + this.getEntityQualifiedColField(col);
      };
      GridRow.prototype.getEntityQualifiedColField = function(col) {
        return gridUtil.preEval('entity.' + col.field);
      };
      GridRow.prototype.setRowInvisible = function(row) {
        if (row && row.setThisRowInvisible) {
          row.setThisRowInvisible('user');
        }
      };
      GridRow.prototype.clearRowInvisible = function(row) {
        if (row && row.clearThisRowInvisible) {
          row.clearThisRowInvisible('user');
        }
      };
      GridRow.prototype.setThisRowInvisible = function(reason, fromRowsProcessor) {
        if (!this.invisibleReason) {
          this.invisibleReason = {};
        }
        this.invisibleReason[reason] = true;
        this.evaluateRowVisibility(fromRowsProcessor);
      };
      GridRow.prototype.clearThisRowInvisible = function(reason, fromRowsProcessor) {
        if (typeof(this.invisibleReason) !== 'undefined') {
          delete this.invisibleReason[reason];
        }
        this.evaluateRowVisibility(fromRowsProcessor);
      };
      GridRow.prototype.evaluateRowVisibility = function(fromRowProcessor) {
        var newVisibility = true;
        if (typeof(this.invisibleReason) !== 'undefined') {
          angular.forEach(this.invisibleReason, function(value, key) {
            if (value) {
              newVisibility = false;
            }
          });
        }
        if (typeof(this.visible) === 'undefined' || this.visible !== newVisibility) {
          this.visible = newVisibility;
          if (!fromRowProcessor) {
            this.grid.queueGridRefresh();
            this.grid.api.core.raise.rowsVisibleChanged(this);
          }
        }
      };
      return GridRow;
    }]);
  })();
  (function() {
    'use strict';
    angular.module('ui.grid').factory('GridRowColumn', ['$parse', '$filter', function GridRowColumnFactory($parse, $filter) {
      var GridRowColumn = function GridRowColumn(row, col) {
        if (!(this instanceof GridRowColumn)) {
          throw "Using GridRowColumn as a function insead of as a constructor. Must be called with `new` keyword";
        }
        this.row = row;
        this.col = col;
      };
      GridRowColumn.prototype.getIntersectionValueRaw = function() {
        var getter = $parse(this.row.getEntityQualifiedColField(this.col));
        var context = this.row;
        return getter(context);
      };
      GridRowColumn.prototype.getIntersectionValueFiltered = function() {
        var value = this.getIntersectionValueRaw();
        if (this.col.cellFilter && this.col.cellFilter !== '') {
          var getFilterIfExists = function(filterName) {
            try {
              return $filter(filterName);
            } catch (e) {
              return null;
            }
          };
          var filter = getFilterIfExists(this.col.cellFilter);
          if (filter) {
            value = filter(value);
          } else {
            var re = /([^:]*):([^:]*):?([\s\S]+)?/;
            var matches;
            if ((matches = re.exec(this.col.cellFilter)) !== null) {
              value = $filter(matches[1])(value, matches[2], matches[3]);
            }
          }
        }
        return value;
      };
      return GridRowColumn;
    }]);
  })();
  (function() {
    angular.module('ui.grid').factory('ScrollEvent', ['gridUtil', function(gridUtil) {
      function ScrollEvent(grid, sourceRowContainer, sourceColContainer, source) {
        var self = this;
        if (!grid) {
          throw new Error("grid argument is required");
        }
        self.grid = grid;
        self.source = source;
        self.withDelay = true;
        self.sourceRowContainer = sourceRowContainer;
        self.sourceColContainer = sourceColContainer;
        self.newScrollLeft = null;
        self.newScrollTop = null;
        self.x = null;
        self.y = null;
        self.verticalScrollLength = -9999999;
        self.horizontalScrollLength = -999999;
        self.fireThrottledScrollingEvent = gridUtil.throttle(function(sourceContainerId) {
          self.grid.scrollContainers(sourceContainerId, self);
        }, self.grid.options.wheelScrollThrottle, {trailing: true});
      }
      ScrollEvent.prototype.getNewScrollLeft = function(colContainer, viewport) {
        var self = this;
        if (!self.newScrollLeft) {
          var scrollWidth = (colContainer.getCanvasWidth() - colContainer.getViewportWidth());
          var oldScrollLeft = gridUtil.normalizeScrollLeft(viewport, self.grid);
          var scrollXPercentage;
          if (typeof(self.x.percentage) !== 'undefined' && self.x.percentage !== undefined) {
            scrollXPercentage = self.x.percentage;
          } else if (typeof(self.x.pixels) !== 'undefined' && self.x.pixels !== undefined) {
            scrollXPercentage = self.x.percentage = (oldScrollLeft + self.x.pixels) / scrollWidth;
          } else {
            throw new Error("No percentage or pixel value provided for scroll event X axis");
          }
          return Math.max(0, scrollXPercentage * scrollWidth);
        }
        return self.newScrollLeft;
      };
      ScrollEvent.prototype.getNewScrollTop = function(rowContainer, viewport) {
        var self = this;
        if (!self.newScrollTop) {
          var scrollLength = rowContainer.getVerticalScrollLength();
          var oldScrollTop = viewport[0].scrollTop;
          var scrollYPercentage;
          if (typeof(self.y.percentage) !== 'undefined' && self.y.percentage !== undefined) {
            scrollYPercentage = self.y.percentage;
          } else if (typeof(self.y.pixels) !== 'undefined' && self.y.pixels !== undefined) {
            scrollYPercentage = self.y.percentage = (oldScrollTop + self.y.pixels) / scrollLength;
          } else {
            throw new Error("No percentage or pixel value provided for scroll event Y axis");
          }
          return Math.max(0, scrollYPercentage * scrollLength);
        }
        return self.newScrollTop;
      };
      ScrollEvent.prototype.atTop = function(scrollTop) {
        return (this.y && (this.y.percentage === 0 || this.verticalScrollLength < 0) && scrollTop === 0);
      };
      ScrollEvent.prototype.atBottom = function(scrollTop) {
        return (this.y && (this.y.percentage === 1 || this.verticalScrollLength === 0) && scrollTop > 0);
      };
      ScrollEvent.prototype.atLeft = function(scrollLeft) {
        return (this.x && (this.x.percentage === 0 || this.horizontalScrollLength < 0) && scrollLeft === 0);
      };
      ScrollEvent.prototype.atRight = function(scrollLeft) {
        return (this.x && (this.x.percentage === 1 || this.horizontalScrollLength === 0) && scrollLeft > 0);
      };
      ScrollEvent.Sources = {
        ViewPortScroll: 'ViewPortScroll',
        RenderContainerMouseWheel: 'RenderContainerMouseWheel',
        RenderContainerTouchMove: 'RenderContainerTouchMove',
        Other: 99
      };
      return ScrollEvent;
    }]);
  })();
  (function() {
    'use strict';
    angular.module('ui.grid').service('gridClassFactory', ['gridUtil', '$q', '$compile', '$templateCache', 'uiGridConstants', 'Grid', 'GridColumn', 'GridRow', function(gridUtil, $q, $compile, $templateCache, uiGridConstants, Grid, GridColumn, GridRow) {
      var service = {
        createGrid: function(options) {
          options = (typeof(options) !== 'undefined') ? options : {};
          options.id = gridUtil.newId();
          var grid = new Grid(options);
          if (grid.options.rowTemplate) {
            var rowTemplateFnPromise = $q.defer();
            grid.getRowTemplateFn = rowTemplateFnPromise.promise;
            gridUtil.getTemplate(grid.options.rowTemplate).then(function(template) {
              var rowTemplateFn = $compile(template);
              rowTemplateFnPromise.resolve(rowTemplateFn);
            }, function(res) {
              throw new Error("Couldn't fetch/use row template '" + grid.options.rowTemplate + "'");
            });
          }
          grid.registerColumnBuilder(service.defaultColumnBuilder);
          grid.registerRowBuilder(service.rowTemplateAssigner);
          grid.registerRowsProcessor(function allRowsVisible(rows) {
            rows.forEach(function(row) {
              row.evaluateRowVisibility(true);
            }, 50);
            return rows;
          });
          grid.registerColumnsProcessor(function allColumnsVisible(columns) {
            columns.forEach(function(column) {
              column.visible = true;
            });
            return columns;
          }, 50);
          grid.registerColumnsProcessor(function(renderableColumns) {
            renderableColumns.forEach(function(column) {
              if (column.colDef.visible === false) {
                column.visible = false;
              }
            });
            return renderableColumns;
          }, 50);
          grid.registerRowsProcessor(grid.searchRows, 100);
          if (grid.options.externalSort && angular.isFunction(grid.options.externalSort)) {
            grid.registerRowsProcessor(grid.options.externalSort, 200);
          } else {
            grid.registerRowsProcessor(grid.sortByColumn, 200);
          }
          return grid;
        },
        defaultColumnBuilder: function(colDef, col, gridOptions) {
          var templateGetPromises = [];
          var processTemplate = function(templateType, providedType, defaultTemplate, filterType, tooltipType) {
            if (!colDef[templateType]) {
              col[providedType] = defaultTemplate;
            } else {
              col[providedType] = colDef[templateType];
            }
            templateGetPromises.push(gridUtil.getTemplate(col[providedType]).then(function(template) {
              if (angular.isFunction(template)) {
                template = template();
              }
              var tooltipCall = (tooltipType === 'cellTooltip') ? 'col.cellTooltip(row,col)' : 'col.headerTooltip(col)';
              if (tooltipType && col[tooltipType] === false) {
                template = template.replace(uiGridConstants.TOOLTIP, '');
              } else if (tooltipType && col[tooltipType]) {
                template = template.replace(uiGridConstants.TOOLTIP, 'title="{{' + tooltipCall + ' CUSTOM_FILTERS }}"');
              }
              if (filterType) {
                col[templateType] = template.replace(uiGridConstants.CUSTOM_FILTERS, function() {
                  return col[filterType] ? "|" + col[filterType] : "";
                });
              } else {
                col[templateType] = template;
              }
            }, function(res) {
              throw new Error("Couldn't fetch/use colDef." + templateType + " '" + colDef[templateType] + "'");
            }));
          };
          processTemplate('cellTemplate', 'providedCellTemplate', 'ui-grid/uiGridCell', 'cellFilter', 'cellTooltip');
          col.cellTemplatePromise = templateGetPromises[0];
          processTemplate('headerCellTemplate', 'providedHeaderCellTemplate', 'ui-grid/uiGridHeaderCell', 'headerCellFilter', 'headerTooltip');
          processTemplate('footerCellTemplate', 'providedFooterCellTemplate', 'ui-grid/uiGridFooterCell', 'footerCellFilter');
          processTemplate('filterHeaderTemplate', 'providedFilterHeaderTemplate', 'ui-grid/ui-grid-filter');
          col.compiledElementFnDefer = $q.defer();
          return $q.all(templateGetPromises);
        },
        rowTemplateAssigner: function rowTemplateAssigner(row) {
          var grid = this;
          if (!row.rowTemplate) {
            row.rowTemplate = grid.options.rowTemplate;
            row.getRowTemplateFn = grid.getRowTemplateFn;
          } else {
            var perRowTemplateFnPromise = $q.defer();
            row.getRowTemplateFn = perRowTemplateFnPromise.promise;
            gridUtil.getTemplate(row.rowTemplate).then(function(template) {
              var rowTemplateFn = $compile(template);
              perRowTemplateFnPromise.resolve(rowTemplateFn);
            }, function(res) {
              throw new Error("Couldn't fetch/use row template '" + row.rowTemplate + "'");
            });
          }
          return row.getRowTemplateFn;
        }
      };
      return service;
    }]);
  })();
  (function() {
    var module = angular.module('ui.grid');
    function escapeRegExp(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }
    module.service('rowSearcher', ['gridUtil', 'uiGridConstants', function(gridUtil, uiGridConstants) {
      var defaultCondition = uiGridConstants.filter.CONTAINS;
      var rowSearcher = {};
      rowSearcher.getTerm = function getTerm(filter) {
        if (typeof(filter.term) === 'undefined') {
          return filter.term;
        }
        var term = filter.term;
        if (typeof(term) === 'string') {
          term = term.trim();
        }
        return term;
      };
      rowSearcher.stripTerm = function stripTerm(filter) {
        var term = rowSearcher.getTerm(filter);
        if (typeof(term) === 'string') {
          return escapeRegExp(term.replace(/(^\*|\*$)/g, ''));
        } else {
          return term;
        }
      };
      rowSearcher.guessCondition = function guessCondition(filter) {
        if (typeof(filter.term) === 'undefined' || !filter.term) {
          return defaultCondition;
        }
        var term = rowSearcher.getTerm(filter);
        if (/\*/.test(term)) {
          var regexpFlags = '';
          if (!filter.flags || !filter.flags.caseSensitive) {
            regexpFlags += 'i';
          }
          var reText = term.replace(/(\\)?\*/g, function($0, $1) {
            return $1 ? $0 : '[\\s\\S]*?';
          });
          return new RegExp('^' + reText + '$', regexpFlags);
        } else {
          return defaultCondition;
        }
      };
      rowSearcher.setupFilters = function setupFilters(filters) {
        var newFilters = [];
        var filtersLength = filters.length;
        for (var i = 0; i < filtersLength; i++) {
          var filter = filters[i];
          if (filter.noTerm || !gridUtil.isNullOrUndefined(filter.term)) {
            var newFilter = {};
            var regexpFlags = '';
            if (!filter.flags || !filter.flags.caseSensitive) {
              regexpFlags += 'i';
            }
            if (!gridUtil.isNullOrUndefined(filter.term)) {
              newFilter.term = rowSearcher.stripTerm(filter);
            }
            if (filter.condition) {
              newFilter.condition = filter.condition;
            } else {
              newFilter.condition = rowSearcher.guessCondition(filter);
            }
            newFilter.flags = angular.extend({
              caseSensitive: false,
              date: false
            }, filter.flags);
            if (newFilter.condition === uiGridConstants.filter.STARTS_WITH) {
              newFilter.startswithRE = new RegExp('^' + newFilter.term, regexpFlags);
            }
            if (newFilter.condition === uiGridConstants.filter.ENDS_WITH) {
              newFilter.endswithRE = new RegExp(newFilter.term + '$', regexpFlags);
            }
            if (newFilter.condition === uiGridConstants.filter.CONTAINS) {
              newFilter.containsRE = new RegExp(newFilter.term, regexpFlags);
            }
            if (newFilter.condition === uiGridConstants.filter.EXACT) {
              newFilter.exactRE = new RegExp('^' + newFilter.term + '$', regexpFlags);
            }
            newFilters.push(newFilter);
          }
        }
        return newFilters;
      };
      rowSearcher.runColumnFilter = function runColumnFilter(grid, row, column, filter) {
        var conditionType = typeof(filter.condition);
        var term = filter.term;
        var value;
        if (column.filterCellFiltered) {
          value = grid.getCellDisplayValue(row, column);
        } else {
          value = grid.getCellValue(row, column);
        }
        if (filter.condition instanceof RegExp) {
          return filter.condition.test(value);
        }
        if (conditionType === 'function') {
          return filter.condition(term, value, row, column);
        }
        if (filter.startswithRE) {
          return filter.startswithRE.test(value);
        }
        if (filter.endswithRE) {
          return filter.endswithRE.test(value);
        }
        if (filter.containsRE) {
          return filter.containsRE.test(value);
        }
        if (filter.exactRE) {
          return filter.exactRE.test(value);
        }
        if (filter.condition === uiGridConstants.filter.NOT_EQUAL) {
          var regex = new RegExp('^' + term + '$');
          return !regex.exec(value);
        }
        if (typeof(value) === 'number' && typeof(term) === 'string') {
          var tempFloat = parseFloat(term.replace(/\\\./, '.').replace(/\\\-/, '-'));
          if (!isNaN(tempFloat)) {
            term = tempFloat;
          }
        }
        if (filter.flags.date === true) {
          value = new Date(value);
          term = new Date(term.replace(/\\/g, ''));
        }
        if (filter.condition === uiGridConstants.filter.GREATER_THAN) {
          return (value > term);
        }
        if (filter.condition === uiGridConstants.filter.GREATER_THAN_OR_EQUAL) {
          return (value >= term);
        }
        if (filter.condition === uiGridConstants.filter.LESS_THAN) {
          return (value < term);
        }
        if (filter.condition === uiGridConstants.filter.LESS_THAN_OR_EQUAL) {
          return (value <= term);
        }
        return true;
      };
      rowSearcher.searchColumn = function searchColumn(grid, row, column, filters) {
        if (grid.options.useExternalFiltering) {
          return true;
        }
        var filtersLength = filters.length;
        for (var i = 0; i < filtersLength; i++) {
          var filter = filters[i];
          var ret = rowSearcher.runColumnFilter(grid, row, column, filter);
          if (!ret) {
            return false;
          }
        }
        return true;
      };
      rowSearcher.search = function search(grid, rows, columns) {
        if (!rows) {
          return;
        }
        if (!grid.options.enableFiltering) {
          return rows;
        }
        var filterData = [];
        var colsLength = columns.length;
        var hasTerm = function(filters) {
          var hasTerm = false;
          filters.forEach(function(filter) {
            if (!gridUtil.isNullOrUndefined(filter.term) && filter.term !== '' || filter.noTerm) {
              hasTerm = true;
            }
          });
          return hasTerm;
        };
        for (var i = 0; i < colsLength; i++) {
          var col = columns[i];
          if (typeof(col.filters) !== 'undefined' && hasTerm(col.filters)) {
            filterData.push({
              col: col,
              filters: rowSearcher.setupFilters(col.filters)
            });
          }
        }
        if (filterData.length > 0) {
          var foreachRow = function(grid, row, col, filters) {
            if (row.visible && !rowSearcher.searchColumn(grid, row, col, filters)) {
              row.visible = false;
            }
          };
          var foreachFilterCol = function(grid, filterData) {
            var rowsLength = rows.length;
            for (var i = 0; i < rowsLength; i++) {
              foreachRow(grid, rows[i], filterData.col, filterData.filters);
            }
          };
          var filterDataLength = filterData.length;
          for (var j = 0; j < filterDataLength; j++) {
            foreachFilterCol(grid, filterData[j]);
          }
          if (grid.api.core.raise.rowsVisibleChanged) {
            grid.api.core.raise.rowsVisibleChanged();
          }
        }
        return rows;
      };
      return rowSearcher;
    }]);
  })();
  (function() {
    var module = angular.module('ui.grid');
    module.service('rowSorter', ['$parse', 'uiGridConstants', function($parse, uiGridConstants) {
      var currencyRegexStr = '(' + uiGridConstants.CURRENCY_SYMBOLS.map(function(a) {
        return '\\' + a;
      }).join('|') + ')?';
      var numberStrRegex = new RegExp('^[-+]?' + currencyRegexStr + '[\\d,.]+' + currencyRegexStr + '%?$');
      var rowSorter = {colSortFnCache: {}};
      rowSorter.guessSortFn = function guessSortFn(itemType) {
        switch (itemType) {
          case "number":
            return rowSorter.sortNumber;
          case "numberStr":
            return rowSorter.sortNumberStr;
          case "boolean":
            return rowSorter.sortBool;
          case "string":
            return rowSorter.sortAlpha;
          case "date":
            return rowSorter.sortDate;
          case "object":
            return rowSorter.basicSort;
          default:
            throw new Error('No sorting function found for type:' + itemType);
        }
      };
      rowSorter.handleNulls = function handleNulls(a, b) {
        if ((!a && a !== 0 && a !== false) || (!b && b !== 0 && b !== false)) {
          if ((!a && a !== 0 && a !== false) && (!b && b !== 0 && b !== false)) {
            return 0;
          } else if (!a && a !== 0 && a !== false) {
            return 1;
          } else if (!b && b !== 0 && b !== false) {
            return -1;
          }
        }
        return null;
      };
      rowSorter.basicSort = function basicSort(a, b) {
        var nulls = rowSorter.handleNulls(a, b);
        if (nulls !== null) {
          return nulls;
        } else {
          if (a === b) {
            return 0;
          }
          if (a < b) {
            return -1;
          }
          return 1;
        }
      };
      rowSorter.sortNumber = function sortNumber(a, b) {
        var nulls = rowSorter.handleNulls(a, b);
        if (nulls !== null) {
          return nulls;
        } else {
          return a - b;
        }
      };
      rowSorter.sortNumberStr = function sortNumberStr(a, b) {
        var nulls = rowSorter.handleNulls(a, b);
        if (nulls !== null) {
          return nulls;
        } else {
          var numA,
              numB,
              badA = false,
              badB = false;
          numA = parseFloat(a.replace(/[^0-9.-]/g, ''));
          if (isNaN(numA)) {
            badA = true;
          }
          numB = parseFloat(b.replace(/[^0-9.-]/g, ''));
          if (isNaN(numB)) {
            badB = true;
          }
          if (badA && badB) {
            return 0;
          }
          if (badA) {
            return 1;
          }
          if (badB) {
            return -1;
          }
          return numA - numB;
        }
      };
      rowSorter.sortAlpha = function sortAlpha(a, b) {
        var nulls = rowSorter.handleNulls(a, b);
        if (nulls !== null) {
          return nulls;
        } else {
          var strA = a.toString().toLowerCase(),
              strB = b.toString().toLowerCase();
          return strA === strB ? 0 : strA.localeCompare(strB);
        }
      };
      rowSorter.sortDate = function sortDate(a, b) {
        var nulls = rowSorter.handleNulls(a, b);
        if (nulls !== null) {
          return nulls;
        } else {
          if (!(a instanceof Date)) {
            a = new Date(a);
          }
          if (!(b instanceof Date)) {
            b = new Date(b);
          }
          var timeA = a.getTime(),
              timeB = b.getTime();
          return timeA === timeB ? 0 : (timeA < timeB ? -1 : 1);
        }
      };
      rowSorter.sortBool = function sortBool(a, b) {
        var nulls = rowSorter.handleNulls(a, b);
        if (nulls !== null) {
          return nulls;
        } else {
          if (a && b) {
            return 0;
          }
          if (!a && !b) {
            return 0;
          } else {
            return a ? 1 : -1;
          }
        }
      };
      rowSorter.getSortFn = function getSortFn(grid, col, rows) {
        var sortFn,
            item;
        if (rowSorter.colSortFnCache[col.colDef.name]) {
          sortFn = rowSorter.colSortFnCache[col.colDef.name];
        } else if (col.sortingAlgorithm !== undefined) {
          sortFn = col.sortingAlgorithm;
          rowSorter.colSortFnCache[col.colDef.name] = col.sortingAlgorithm;
        } else if (col.sortCellFiltered && col.cellFilter) {
          sortFn = rowSorter.sortAlpha;
          rowSorter.colSortFnCache[col.colDef.name] = sortFn;
        } else {
          sortFn = rowSorter.guessSortFn(col.colDef.type);
          if (sortFn) {
            rowSorter.colSortFnCache[col.colDef.name] = sortFn;
          } else {
            sortFn = rowSorter.sortAlpha;
          }
        }
        return sortFn;
      };
      rowSorter.prioritySort = function(a, b) {
        if (a.sort.priority !== undefined && b.sort.priority !== undefined) {
          if (a.sort.priority < b.sort.priority) {
            return -1;
          } else if (a.sort.priority === b.sort.priority) {
            return 0;
          } else {
            return 1;
          }
        } else if (a.sort.priority || a.sort.priority === undefined) {
          return -1;
        } else if (b.sort.priority || b.sort.priority === undefined) {
          return 1;
        } else {
          return 0;
        }
      };
      rowSorter.sort = function rowSorterSort(grid, rows, columns) {
        if (!rows) {
          return;
        }
        if (grid.options.useExternalSorting) {
          return rows;
        }
        var sortCols = [];
        columns.forEach(function(col) {
          if (col.sort && !col.sort.ignoreSort && col.sort.direction && (col.sort.direction === uiGridConstants.ASC || col.sort.direction === uiGridConstants.DESC)) {
            sortCols.push(col);
          }
        });
        sortCols = sortCols.sort(rowSorter.prioritySort);
        if (sortCols.length === 0) {
          return rows;
        }
        var col,
            direction;
        var setIndex = function(row, idx) {
          row.entity.$$uiGridIndex = idx;
        };
        rows.forEach(setIndex);
        var r = rows.slice(0);
        var rowSortFn = function(rowA, rowB) {
          var tem = 0,
              idx = 0,
              sortFn;
          while (tem === 0 && idx < sortCols.length) {
            col = sortCols[idx];
            direction = sortCols[idx].sort.direction;
            sortFn = rowSorter.getSortFn(grid, col, r);
            var propA,
                propB;
            if (col.sortCellFiltered) {
              propA = grid.getCellDisplayValue(rowA, col);
              propB = grid.getCellDisplayValue(rowB, col);
            } else {
              propA = grid.getCellValue(rowA, col);
              propB = grid.getCellValue(rowB, col);
            }
            tem = sortFn(propA, propB, rowA, rowB, direction);
            idx++;
          }
          if (tem === 0) {
            return rowA.entity.$$uiGridIndex - rowB.entity.$$uiGridIndex;
          }
          if (direction === uiGridConstants.ASC) {
            return tem;
          } else {
            return 0 - tem;
          }
        };
        var newRows = rows.sort(rowSortFn);
        var clearIndex = function(row, idx) {
          delete row.entity.$$uiGridIndex;
        };
        rows.forEach(clearIndex);
        return newRows;
      };
      return rowSorter;
    }]);
  })();
  (function() {
    var module = angular.module('ui.grid');
    var bindPolyfill;
    if (typeof Function.prototype.bind !== "function") {
      bindPolyfill = function() {
        var slice = Array.prototype.slice;
        return function(context) {
          var fn = this,
              args = slice.call(arguments, 1);
          if (args.length) {
            return function() {
              return arguments.length ? fn.apply(context, args.concat(slice.call(arguments))) : fn.apply(context, args);
            };
          }
          return function() {
            return arguments.length ? fn.apply(context, arguments) : fn.call(context);
          };
        };
      };
    }
    function getStyles(elem) {
      var e = elem;
      if (typeof(e.length) !== 'undefined' && e.length) {
        e = elem[0];
      }
      return e.ownerDocument.defaultView.getComputedStyle(e, null);
    }
    var rnumnonpx = new RegExp("^(" + (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source + ")(?!px)[a-z%]+$", "i"),
        rdisplayswap = /^(block|none|table(?!-c[ea]).+)/,
        cssShow = {
          position: "absolute",
          visibility: "hidden",
          display: "block"
        };
    function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {
      var i = extra === (isBorderBox ? 'border' : 'content') ? 4 : name === 'width' ? 1 : 0,
          val = 0;
      var sides = ['Top', 'Right', 'Bottom', 'Left'];
      for (; i < 4; i += 2) {
        var side = sides[i];
        if (extra === 'margin') {
          var marg = parseFloat(styles[extra + side]);
          if (!isNaN(marg)) {
            val += marg;
          }
        }
        if (isBorderBox) {
          if (extra === 'content') {
            var padd = parseFloat(styles['padding' + side]);
            if (!isNaN(padd)) {
              val -= padd;
            }
          }
          if (extra !== 'margin') {
            var bordermarg = parseFloat(styles['border' + side + 'Width']);
            if (!isNaN(bordermarg)) {
              val -= bordermarg;
            }
          }
        } else {
          var nocontentPad = parseFloat(styles['padding' + side]);
          if (!isNaN(nocontentPad)) {
            val += nocontentPad;
          }
          if (extra !== 'padding') {
            var nocontentnopad = parseFloat(styles['border' + side + 'Width']);
            if (!isNaN(nocontentnopad)) {
              val += nocontentnopad;
            }
          }
        }
      }
      return val;
    }
    function getWidthOrHeight(elem, name, extra) {
      var valueIsBorderBox = true,
          val,
          styles = getStyles(elem),
          isBorderBox = styles['boxSizing'] === 'border-box';
      if (val <= 0 || val == null) {
        val = styles[name];
        if (val < 0 || val == null) {
          val = elem.style[name];
        }
        if (rnumnonpx.test(val)) {
          return val;
        }
        valueIsBorderBox = isBorderBox && (true || val === elem.style[name]);
        val = parseFloat(val) || 0;
      }
      var ret = (val + augmentWidthOrHeight(elem, name, extra || (isBorderBox ? "border" : "content"), valueIsBorderBox, styles));
      return ret;
    }
    function getLineHeight(elm) {
      elm = angular.element(elm)[0];
      var parent = elm.parentElement;
      if (!parent) {
        parent = document.getElementsByTagName('body')[0];
      }
      return parseInt(getStyles(parent).fontSize) || parseInt(getStyles(elm).fontSize) || 16;
    }
    var uid = ['0', '0', '0', '0'];
    var uidPrefix = 'uiGrid-';
    module.service('gridUtil', ['$log', '$window', '$document', '$http', '$templateCache', '$timeout', '$interval', '$injector', '$q', '$interpolate', 'uiGridConstants', function($log, $window, $document, $http, $templateCache, $timeout, $interval, $injector, $q, $interpolate, uiGridConstants) {
      var s = {
        augmentWidthOrHeight: augmentWidthOrHeight,
        getStyles: getStyles,
        createBoundedWrapper: function(object, method) {
          return function() {
            return method.apply(object, arguments);
          };
        },
        readableColumnName: function(columnName) {
          if (typeof(columnName) === 'undefined' || columnName === undefined || columnName === null) {
            return columnName;
          }
          if (typeof(columnName) !== 'string') {
            columnName = String(columnName);
          }
          return columnName.replace(/_+/g, ' ').replace(/^[A-Z]+$/, function(match) {
            return angular.lowercase(angular.uppercase(match.charAt(0)) + match.slice(1));
          }).replace(/([\w\u00C0-\u017F]+)/g, function(match) {
            return angular.uppercase(match.charAt(0)) + match.slice(1);
          }).replace(/(\w+?(?=[A-Z]))/g, '$1 ');
        },
        getColumnsFromData: function(data, excludeProperties) {
          var columnDefs = [];
          if (!data || typeof(data[0]) === 'undefined' || data[0] === undefined) {
            return [];
          }
          if (angular.isUndefined(excludeProperties)) {
            excludeProperties = [];
          }
          var item = data[0];
          angular.forEach(item, function(prop, propName) {
            if (excludeProperties.indexOf(propName) === -1) {
              columnDefs.push({name: propName});
            }
          });
          return columnDefs;
        },
        newId: (function() {
          var seedId = new Date().getTime();
          return function() {
            return seedId += 1;
          };
        })(),
        getTemplate: function(template) {
          if ($templateCache.get(template)) {
            return s.postProcessTemplate($templateCache.get(template));
          }
          if (template.hasOwnProperty('then')) {
            return template.then(s.postProcessTemplate);
          }
          try {
            if (angular.element(template).length > 0) {
              return $q.when(template).then(s.postProcessTemplate);
            }
          } catch (err) {}
          s.logDebug('fetching url', template);
          return $http({
            method: 'GET',
            url: template
          }).then(function(result) {
            var templateHtml = result.data.trim();
            $templateCache.put(template, templateHtml);
            return templateHtml;
          }, function(err) {
            throw new Error("Could not get template " + template + ": " + err);
          }).then(s.postProcessTemplate);
        },
        postProcessTemplate: function(template) {
          var startSym = $interpolate.startSymbol(),
              endSym = $interpolate.endSymbol();
          if (startSym !== '{{' || endSym !== '}}') {
            template = template.replace(/\{\{/g, startSym);
            template = template.replace(/\}\}/g, endSym);
          }
          return $q.when(template);
        },
        guessType: function(item) {
          var itemType = typeof(item);
          switch (itemType) {
            case "number":
            case "boolean":
            case "string":
              return itemType;
            default:
              if (angular.isDate(item)) {
                return "date";
              }
              return "object";
          }
        },
        elementWidth: function(elem) {},
        elementHeight: function(elem) {},
        getScrollbarWidth: function() {
          var outer = document.createElement("div");
          outer.style.visibility = "hidden";
          outer.style.width = "100px";
          outer.style.msOverflowStyle = "scrollbar";
          document.body.appendChild(outer);
          var widthNoScroll = outer.offsetWidth;
          outer.style.overflow = "scroll";
          var inner = document.createElement("div");
          inner.style.width = "100%";
          outer.appendChild(inner);
          var widthWithScroll = inner.offsetWidth;
          outer.parentNode.removeChild(outer);
          return widthNoScroll - widthWithScroll;
        },
        swap: function(elem, options, callback, args) {
          var ret,
              name,
              old = {};
          for (name in options) {
            old[name] = elem.style[name];
            elem.style[name] = options[name];
          }
          ret = callback.apply(elem, args || []);
          for (name in options) {
            elem.style[name] = old[name];
          }
          return ret;
        },
        fakeElement: function(elem, options, callback, args) {
          var ret,
              name,
              newElement = angular.element(elem).clone()[0];
          for (name in options) {
            newElement.style[name] = options[name];
          }
          angular.element(document.body).append(newElement);
          ret = callback.call(newElement, newElement);
          angular.element(newElement).remove();
          return ret;
        },
        normalizeWheelEvent: function(event) {
          var lowestDelta,
              lowestDeltaXY;
          var orgEvent = event || window.event,
              args = [].slice.call(arguments, 1),
              delta = 0,
              deltaX = 0,
              deltaY = 0,
              absDelta = 0,
              absDeltaXY = 0,
              fn;
          if (orgEvent.originalEvent) {
            orgEvent = orgEvent.originalEvent;
          }
          if (orgEvent.wheelDelta) {
            delta = orgEvent.wheelDelta;
          }
          if (orgEvent.detail) {
            delta = orgEvent.detail * -1;
          }
          deltaY = delta;
          if (orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS) {
            deltaY = 0;
            deltaX = delta * -1;
          }
          if (orgEvent.deltaY) {
            deltaY = orgEvent.deltaY * -1;
            delta = deltaY;
          }
          if (orgEvent.deltaX) {
            deltaX = orgEvent.deltaX;
            delta = deltaX * -1;
          }
          if (orgEvent.wheelDeltaY !== undefined) {
            deltaY = orgEvent.wheelDeltaY;
          }
          if (orgEvent.wheelDeltaX !== undefined) {
            deltaX = orgEvent.wheelDeltaX;
          }
          absDelta = Math.abs(delta);
          if (!lowestDelta || absDelta < lowestDelta) {
            lowestDelta = absDelta;
          }
          absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
          if (!lowestDeltaXY || absDeltaXY < lowestDeltaXY) {
            lowestDeltaXY = absDeltaXY;
          }
          fn = delta > 0 ? 'floor' : 'ceil';
          delta = Math[fn](delta / lowestDelta);
          deltaX = Math[fn](deltaX / lowestDeltaXY);
          deltaY = Math[fn](deltaY / lowestDeltaXY);
          return {
            delta: delta,
            deltaX: deltaX,
            deltaY: deltaY
          };
        },
        isTouchEnabled: function() {
          var bool;
          if (('ontouchstart' in $window) || $window.DocumentTouch && $document instanceof DocumentTouch) {
            bool = true;
          }
          return bool;
        },
        isNullOrUndefined: function(obj) {
          if (obj === undefined || obj === null) {
            return true;
          }
          return false;
        },
        endsWith: function(str, suffix) {
          if (!str || !suffix || typeof str !== "string") {
            return false;
          }
          return str.indexOf(suffix, str.length - suffix.length) !== -1;
        },
        arrayContainsObjectWithProperty: function(array, propertyName, propertyValue) {
          var found = false;
          angular.forEach(array, function(object) {
            if (object[propertyName] === propertyValue) {
              found = true;
            }
          });
          return found;
        },
        numericAndNullSort: function(a, b) {
          if (a === null) {
            return 1;
          }
          if (b === null) {
            return -1;
          }
          if (a === null && b === null) {
            return 0;
          }
          return a - b;
        },
        disableAnimations: function(element) {
          var $animate;
          try {
            $animate = $injector.get('$animate');
            if (angular.version.major > 1 || (angular.version.major === 1 && angular.version.minor >= 4)) {
              $animate.enabled(element, false);
            } else {
              $animate.enabled(false, element);
            }
          } catch (e) {}
        },
        enableAnimations: function(element) {
          var $animate;
          try {
            $animate = $injector.get('$animate');
            if (angular.version.major > 1 || (angular.version.major === 1 && angular.version.minor >= 4)) {
              $animate.enabled(element, true);
            } else {
              $animate.enabled(true, element);
            }
            return $animate;
          } catch (e) {}
        },
        nextUid: function nextUid() {
          var index = uid.length;
          var digit;
          while (index) {
            index--;
            digit = uid[index].charCodeAt(0);
            if (digit === 57) {
              uid[index] = 'A';
              return uidPrefix + uid.join('');
            }
            if (digit === 90) {
              uid[index] = '0';
            } else {
              uid[index] = String.fromCharCode(digit + 1);
              return uidPrefix + uid.join('');
            }
          }
          uid.unshift('0');
          return uidPrefix + uid.join('');
        },
        hashKey: function hashKey(obj) {
          var objType = typeof obj,
              key;
          if (objType === 'object' && obj !== null) {
            if (typeof(key = obj.$$hashKey) === 'function') {
              key = obj.$$hashKey();
            } else if (typeof(obj.$$hashKey) !== 'undefined' && obj.$$hashKey) {
              key = obj.$$hashKey;
            } else if (key === undefined) {
              key = obj.$$hashKey = s.nextUid();
            }
          } else {
            key = obj;
          }
          return objType + ':' + key;
        },
        resetUids: function() {
          uid = ['0', '0', '0'];
        },
        logError: function(logMessage) {
          if (uiGridConstants.LOG_ERROR_MESSAGES) {
            $log.error(logMessage);
          }
        },
        logWarn: function(logMessage) {
          if (uiGridConstants.LOG_WARN_MESSAGES) {
            $log.warn(logMessage);
          }
        },
        logDebug: function() {
          if (uiGridConstants.LOG_DEBUG_MESSAGES) {
            $log.debug.apply($log, arguments);
          }
        }
      };
      s.focus = {
        queue: [],
        byId: function(id, Grid) {
          this._purgeQueue();
          var promise = $timeout(function() {
            var elementID = (Grid && Grid.id ? Grid.id + '-' : '') + id;
            var element = $window.document.getElementById(elementID);
            if (element) {
              element.focus();
            } else {
              s.logWarn('[focus.byId] Element id ' + elementID + ' was not found.');
            }
          });
          this.queue.push(promise);
          return promise;
        },
        byElement: function(element) {
          if (!angular.isElement(element)) {
            s.logWarn("Trying to focus on an element that isn\'t an element.");
            return $q.reject('not-element');
          }
          element = angular.element(element);
          this._purgeQueue();
          var promise = $timeout(function() {
            if (element) {
              element[0].focus();
            }
          });
          this.queue.push(promise);
          return promise;
        },
        bySelector: function(parentElement, querySelector, aSync) {
          var self = this;
          if (!angular.isElement(parentElement)) {
            throw new Error("The parent element is not an element.");
          }
          parentElement = angular.element(parentElement);
          var focusBySelector = function() {
            var element = parentElement[0].querySelector(querySelector);
            return self.byElement(element);
          };
          this._purgeQueue();
          if (aSync) {
            var promise = $timeout(focusBySelector);
            this.queue.push($timeout(focusBySelector));
            return promise;
          } else {
            return focusBySelector();
          }
        },
        _purgeQueue: function() {
          this.queue.forEach(function(element) {
            $timeout.cancel(element);
          });
          this.queue = [];
        }
      };
      ['width', 'height'].forEach(function(name) {
        var capsName = angular.uppercase(name.charAt(0)) + name.substr(1);
        s['element' + capsName] = function(elem, extra) {
          var e = elem;
          if (e && typeof(e.length) !== 'undefined' && e.length) {
            e = elem[0];
          }
          if (e) {
            var styles = getStyles(e);
            return e.offsetWidth === 0 && rdisplayswap.test(styles.display) ? s.swap(e, cssShow, function() {
              return getWidthOrHeight(e, name, extra);
            }) : getWidthOrHeight(e, name, extra);
          } else {
            return null;
          }
        };
        s['outerElement' + capsName] = function(elem, margin) {
          return elem ? s['element' + capsName].call(this, elem, margin ? 'margin' : 'border') : null;
        };
      });
      s.closestElm = function closestElm(el, selector) {
        if (typeof(el.length) !== 'undefined' && el.length) {
          el = el[0];
        }
        var matchesFn;
        ['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'].some(function(fn) {
          if (typeof document.body[fn] === 'function') {
            matchesFn = fn;
            return true;
          }
          return false;
        });
        var parent;
        while (el !== null) {
          parent = el.parentElement;
          if (parent !== null && parent[matchesFn](selector)) {
            return parent;
          }
          el = parent;
        }
        return null;
      };
      s.type = function(obj) {
        var text = Function.prototype.toString.call(obj.constructor);
        return text.match(/function (.*?)\(/)[1];
      };
      s.getBorderSize = function getBorderSize(elem, borderType) {
        if (typeof(elem.length) !== 'undefined' && elem.length) {
          elem = elem[0];
        }
        var styles = getStyles(elem);
        if (borderType) {
          borderType = 'border' + borderType.charAt(0).toUpperCase() + borderType.slice(1);
        } else {
          borderType = 'border';
        }
        borderType += 'Width';
        var val = parseInt(styles[borderType], 10);
        if (isNaN(val)) {
          return 0;
        } else {
          return val;
        }
      };
      s.detectBrowser = function detectBrowser() {
        var userAgent = $window.navigator.userAgent;
        var browsers = {
          chrome: /chrome/i,
          safari: /safari/i,
          firefox: /firefox/i,
          ie: /internet explorer|trident\//i
        };
        for (var key in browsers) {
          if (browsers[key].test(userAgent)) {
            return key;
          }
        }
        return 'unknown';
      };
      s.rtlScrollType = function rtlScrollType() {
        if (rtlScrollType.type) {
          return rtlScrollType.type;
        }
        var definer = angular.element('<div dir="rtl" style="font-size: 14px; width: 1px; height: 1px; position: absolute; top: -1000px; overflow: scroll">A</div>')[0],
            type = 'reverse';
        document.body.appendChild(definer);
        if (definer.scrollLeft > 0) {
          type = 'default';
        } else {
          definer.scrollLeft = 1;
          if (definer.scrollLeft === 0) {
            type = 'negative';
          }
        }
        angular.element(definer).remove();
        rtlScrollType.type = type;
        return type;
      };
      s.normalizeScrollLeft = function normalizeScrollLeft(element, grid) {
        if (typeof(element.length) !== 'undefined' && element.length) {
          element = element[0];
        }
        var scrollLeft = element.scrollLeft;
        if (grid.isRTL()) {
          switch (s.rtlScrollType()) {
            case 'default':
              return element.scrollWidth - scrollLeft - element.clientWidth;
            case 'negative':
              return Math.abs(scrollLeft);
            case 'reverse':
              return scrollLeft;
          }
        }
        return scrollLeft;
      };
      s.denormalizeScrollLeft = function denormalizeScrollLeft(element, scrollLeft, grid) {
        if (typeof(element.length) !== 'undefined' && element.length) {
          element = element[0];
        }
        if (grid.isRTL()) {
          switch (s.rtlScrollType()) {
            case 'default':
              var maxScrollLeft = element.scrollWidth - element.clientWidth;
              return maxScrollLeft - scrollLeft;
            case 'negative':
              return scrollLeft * -1;
            case 'reverse':
              return scrollLeft;
          }
        }
        return scrollLeft;
      };
      s.preEval = function(path) {
        var m = uiGridConstants.BRACKET_REGEXP.exec(path);
        if (m) {
          return (m[1] ? s.preEval(m[1]) : m[1]) + m[2] + (m[3] ? s.preEval(m[3]) : m[3]);
        } else {
          path = path.replace(uiGridConstants.APOS_REGEXP, '\\\'');
          var parts = path.split(uiGridConstants.DOT_REGEXP);
          var preparsed = [parts.shift()];
          angular.forEach(parts, function(part) {
            preparsed.push(part.replace(uiGridConstants.FUNC_REGEXP, '\']$1'));
          });
          return preparsed.join('[\'');
        }
      };
      s.debounce = function(func, wait, immediate) {
        var timeout,
            args,
            context,
            result;
        function debounce() {
          context = this;
          args = arguments;
          var later = function() {
            timeout = null;
            if (!immediate) {
              result = func.apply(context, args);
            }
          };
          var callNow = immediate && !timeout;
          if (timeout) {
            $timeout.cancel(timeout);
          }
          timeout = $timeout(later, wait, false);
          if (callNow) {
            result = func.apply(context, args);
          }
          return result;
        }
        debounce.cancel = function() {
          $timeout.cancel(timeout);
          timeout = null;
        };
        return debounce;
      };
      s.throttle = function(func, wait, options) {
        options = options || {};
        var lastCall = 0,
            queued = null,
            context,
            args;
        function runFunc(endDate) {
          lastCall = +new Date();
          func.apply(context, args);
          $interval(function() {
            queued = null;
          }, 0, 1, false);
        }
        return function() {
          context = this;
          args = arguments;
          if (queued === null) {
            var sinceLast = +new Date() - lastCall;
            if (sinceLast > wait) {
              runFunc();
            } else if (options.trailing) {
              queued = $interval(runFunc, wait - sinceLast, 1, false);
            }
          }
        };
      };
      s.on = {};
      s.off = {};
      s._events = {};
      s.addOff = function(eventName) {
        s.off[eventName] = function(elm, fn) {
          var idx = s._events[eventName].indexOf(fn);
          if (idx > 0) {
            s._events[eventName].removeAt(idx);
          }
        };
      };
      var mouseWheeltoBind = ('onwheel' in document || document.documentMode >= 9) ? ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
          nullLowestDeltaTimeout,
          lowestDelta;
      s.on.mousewheel = function(elm, fn) {
        if (!elm || !fn) {
          return;
        }
        var $elm = angular.element(elm);
        $elm.data('mousewheel-line-height', getLineHeight($elm));
        $elm.data('mousewheel-page-height', s.elementHeight($elm));
        if (!$elm.data('mousewheel-callbacks')) {
          $elm.data('mousewheel-callbacks', {});
        }
        var cbs = $elm.data('mousewheel-callbacks');
        cbs[fn] = (Function.prototype.bind || bindPolyfill).call(mousewheelHandler, $elm[0], fn);
        for (var i = mouseWheeltoBind.length; i; ) {
          $elm.on(mouseWheeltoBind[--i], cbs[fn]);
        }
      };
      s.off.mousewheel = function(elm, fn) {
        var $elm = angular.element(elm);
        var cbs = $elm.data('mousewheel-callbacks');
        var handler = cbs[fn];
        if (handler) {
          for (var i = mouseWheeltoBind.length; i; ) {
            $elm.off(mouseWheeltoBind[--i], handler);
          }
        }
        delete cbs[fn];
        if (Object.keys(cbs).length === 0) {
          $elm.removeData('mousewheel-line-height');
          $elm.removeData('mousewheel-page-height');
          $elm.removeData('mousewheel-callbacks');
        }
      };
      function mousewheelHandler(fn, event) {
        var $elm = angular.element(this);
        var delta = 0,
            deltaX = 0,
            deltaY = 0,
            absDelta = 0,
            offsetX = 0,
            offsetY = 0;
        if (event.originalEvent) {
          event = event.originalEvent;
        }
        if ('detail' in event) {
          deltaY = event.detail * -1;
        }
        if ('wheelDelta' in event) {
          deltaY = event.wheelDelta;
        }
        if ('wheelDeltaY' in event) {
          deltaY = event.wheelDeltaY;
        }
        if ('wheelDeltaX' in event) {
          deltaX = event.wheelDeltaX * -1;
        }
        if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) {
          deltaX = deltaY * -1;
          deltaY = 0;
        }
        delta = deltaY === 0 ? deltaX : deltaY;
        if ('deltaY' in event) {
          deltaY = event.deltaY * -1;
          delta = deltaY;
        }
        if ('deltaX' in event) {
          deltaX = event.deltaX;
          if (deltaY === 0) {
            delta = deltaX * -1;
          }
        }
        if (deltaY === 0 && deltaX === 0) {
          return;
        }
        if (event.deltaMode === 1) {
          var lineHeight = $elm.data('mousewheel-line-height');
          delta *= lineHeight;
          deltaY *= lineHeight;
          deltaX *= lineHeight;
        } else if (event.deltaMode === 2) {
          var pageHeight = $elm.data('mousewheel-page-height');
          delta *= pageHeight;
          deltaY *= pageHeight;
          deltaX *= pageHeight;
        }
        absDelta = Math.max(Math.abs(deltaY), Math.abs(deltaX));
        if (!lowestDelta || absDelta < lowestDelta) {
          lowestDelta = absDelta;
          if (shouldAdjustOldDeltas(event, absDelta)) {
            lowestDelta /= 40;
          }
        }
        delta = Math[delta >= 1 ? 'floor' : 'ceil'](delta / lowestDelta);
        deltaX = Math[deltaX >= 1 ? 'floor' : 'ceil'](deltaX / lowestDelta);
        deltaY = Math[deltaY >= 1 ? 'floor' : 'ceil'](deltaY / lowestDelta);
        event.deltaMode = 0;
        var newEvent = {
          originalEvent: event,
          deltaX: deltaX,
          deltaY: deltaY,
          deltaFactor: lowestDelta,
          preventDefault: function() {
            event.preventDefault();
          },
          stopPropagation: function() {
            event.stopPropagation();
          }
        };
        if (nullLowestDeltaTimeout) {
          clearTimeout(nullLowestDeltaTimeout);
        }
        nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);
        fn.call($elm[0], newEvent);
      }
      function nullLowestDelta() {
        lowestDelta = null;
      }
      function shouldAdjustOldDeltas(orgEvent, absDelta) {
        return orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
      }
      return s;
    }]);
    module.filter('px', function() {
      return function(str) {
        if (str.match(/^[\d\.]+$/)) {
          return str + 'px';
        } else {
          return str;
        }
      };
    });
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        var lang = {
          aggregate: {label: 'položky'},
          groupPanel: {description: 'Přesuňte záhlaví zde pro vytvoření skupiny dle sloupce.'},
          search: {
            placeholder: 'Hledat...',
            showingItems: 'Zobrazuji položky:',
            selectedItems: 'Vybrané položky:',
            totalItems: 'Celkem položek:',
            size: 'Velikost strany:',
            first: 'První strana',
            next: 'Další strana',
            previous: 'Předchozí strana',
            last: 'Poslední strana'
          },
          menu: {text: 'Vyberte sloupec:'},
          sort: {
            ascending: 'Seřadit od A-Z',
            descending: 'Seřadit od Z-A',
            remove: 'Odebrat seřazení'
          },
          column: {hide: 'Schovat sloupec'},
          aggregation: {
            count: 'celkem řádků: ',
            sum: 'celkem: ',
            avg: 'avg: ',
            min: 'min.: ',
            max: 'max.: '
          },
          pinning: {
            pinLeft: 'Zamknout vlevo',
            pinRight: 'Zamknout vpravo',
            unpin: 'Odemknout'
          },
          gridMenu: {
            columns: 'Sloupce:',
            importerTitle: 'Importovat soubor',
            exporterAllAsCsv: 'Exportovat všechna data do csv',
            exporterVisibleAsCsv: 'Exportovat viditelná data do csv',
            exporterSelectedAsCsv: 'Exportovat vybraná data do csv',
            exporterAllAsPdf: 'Exportovat všechna data do pdf',
            exporterVisibleAsPdf: 'Exportovat viditelná data do pdf',
            exporterSelectedAsPdf: 'Exportovat vybraná data do pdf',
            clearAllFilters: 'Odstranit všechny filtry'
          },
          importer: {
            noHeaders: 'Názvy sloupců se nepodařilo získat, obsahuje soubor záhlaví?',
            noObjects: 'Data se nepodařilo zpracovat, obsahuje soubor řádky mimo záhlaví?',
            invalidCsv: 'Soubor nelze zpracovat, jedná se o CSV?',
            invalidJson: 'Soubor nelze zpracovat, je to JSON?',
            jsonNotArray: 'Soubor musí obsahovat json. Ukončuji..'
          },
          pagination: {
            sizes: 'položek na stránku',
            totalItems: 'položek'
          },
          grouping: {
            group: 'Seskupit',
            ungroup: 'Odebrat seskupení',
            aggregate_count: 'Agregace: Count',
            aggregate_sum: 'Agregace: Sum',
            aggregate_max: 'Agregace: Max',
            aggregate_min: 'Agregace: Min',
            aggregate_avg: 'Agregace: Avg',
            aggregate_remove: 'Agregace: Odebrat'
          }
        };
        $delegate.add('cs', lang);
        $delegate.add('cz', lang);
        $delegate.add('cs-cz', lang);
        $delegate.add('cs-CZ', lang);
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('da', {
          aggregate: {label: 'artikler'},
          groupPanel: {description: 'Grupér rækker udfra en kolonne ved at trække dens overskift hertil.'},
          search: {
            placeholder: 'Søg...',
            showingItems: 'Viste rækker:',
            selectedItems: 'Valgte rækker:',
            totalItems: 'Rækker totalt:',
            size: 'Side størrelse:',
            first: 'Første side',
            next: 'Næste side',
            previous: 'Forrige side',
            last: 'Sidste side'
          },
          menu: {text: 'Vælg kolonner:'},
          sort: {
            ascending: 'Sorter stigende',
            descending: 'Sorter faldende',
            none: 'Sorter ingen',
            remove: 'Fjern sortering'
          },
          column: {hide: 'Skjul kolonne'},
          aggregation: {
            count: 'antal rækker: ',
            sum: 'sum: ',
            avg: 'gns: ',
            min: 'min: ',
            max: 'max: '
          },
          gridMenu: {
            columns: 'Columns:',
            importerTitle: 'Import file',
            exporterAllAsCsv: 'Export all data as csv',
            exporterVisibleAsCsv: 'Export visible data as csv',
            exporterSelectedAsCsv: 'Export selected data as csv',
            exporterAllAsPdf: 'Export all data as pdf',
            exporterVisibleAsPdf: 'Export visible data as pdf',
            exporterSelectedAsPdf: 'Export selected data as pdf',
            clearAllFilters: 'Clear all filters'
          },
          importer: {
            noHeaders: 'Column names were unable to be derived, does the file have a header?',
            noObjects: 'Objects were not able to be derived, was there data in the file other than headers?',
            invalidCsv: 'File was unable to be processed, is it valid CSV?',
            invalidJson: 'File was unable to be processed, is it valid Json?',
            jsonNotArray: 'Imported json file must contain an array, aborting.'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('de', {
          headerCell: {
            aria: {
              defaultFilterLabel: 'Filter für Spalte',
              removeFilter: 'Filter löschen',
              columnMenuButtonLabel: 'Spaltenmenü'
            },
            priority: 'Priorität:',
            filterLabel: "Filter für Spalte: "
          },
          aggregate: {label: 'Eintrag'},
          groupPanel: {description: 'Ziehen Sie eine Spaltenüberschrift hierhin, um nach dieser Spalte zu gruppieren.'},
          search: {
            placeholder: 'Suche...',
            showingItems: 'Zeige Einträge:',
            selectedItems: 'Ausgewählte Einträge:',
            totalItems: 'Einträge gesamt:',
            size: 'Einträge pro Seite:',
            first: 'Erste Seite',
            next: 'Nächste Seite',
            previous: 'Vorherige Seite',
            last: 'Letzte Seite'
          },
          menu: {text: 'Spalten auswählen:'},
          sort: {
            ascending: 'aufsteigend sortieren',
            descending: 'absteigend sortieren',
            none: 'keine Sortierung',
            remove: 'Sortierung zurücksetzen'
          },
          column: {hide: 'Spalte ausblenden'},
          aggregation: {
            count: 'Zeilen insgesamt: ',
            sum: 'gesamt: ',
            avg: 'Durchschnitt: ',
            min: 'min: ',
            max: 'max: '
          },
          pinning: {
            pinLeft: 'Links anheften',
            pinRight: 'Rechts anheften',
            unpin: 'Lösen'
          },
          columnMenu: {close: 'Schließen'},
          gridMenu: {
            aria: {buttonLabel: 'Tabellenmenü'},
            columns: 'Spalten:',
            importerTitle: 'Datei importieren',
            exporterAllAsCsv: 'Alle Daten als CSV exportieren',
            exporterVisibleAsCsv: 'sichtbare Daten als CSV exportieren',
            exporterSelectedAsCsv: 'markierte Daten als CSV exportieren',
            exporterAllAsPdf: 'Alle Daten als PDF exportieren',
            exporterVisibleAsPdf: 'sichtbare Daten als PDF exportieren',
            exporterSelectedAsPdf: 'markierte Daten als CSV exportieren',
            clearAllFilters: 'Alle Filter zurücksetzen'
          },
          importer: {
            noHeaders: 'Es konnten keine Spaltennamen ermittelt werden. Sind in der Datei Spaltendefinitionen enthalten?',
            noObjects: 'Es konnten keine Zeileninformationen gelesen werden, Sind in der Datei außer den Spaltendefinitionen auch Daten enthalten?',
            invalidCsv: 'Die Datei konnte nicht eingelesen werden, ist es eine gültige CSV-Datei?',
            invalidJson: 'Die Datei konnte nicht eingelesen werden. Enthält sie gültiges JSON?',
            jsonNotArray: 'Die importierte JSON-Datei muß ein Array enthalten. Breche Import ab.'
          },
          pagination: {
            aria: {
              pageToFirst: 'Zum Anfang',
              pageBack: 'Seite zurück',
              pageSelected: 'Ausgwählte Seite',
              pageForward: 'Seite vor',
              pageToLast: 'Zum Ende'
            },
            sizes: 'Einträge pro Seite',
            totalItems: 'Einträge',
            through: 'bis',
            of: 'von'
          },
          grouping: {
            group: 'Gruppieren',
            ungroup: 'Gruppierung aufheben',
            aggregate_count: 'Agg: Anzahl',
            aggregate_sum: 'Agg: Summe',
            aggregate_max: 'Agg: Maximum',
            aggregate_min: 'Agg: Minimum',
            aggregate_avg: 'Agg: Mittelwert',
            aggregate_remove: 'Aggregation entfernen'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('en', {
          headerCell: {
            aria: {
              defaultFilterLabel: 'Filter for column',
              removeFilter: 'Remove Filter',
              columnMenuButtonLabel: 'Column Menu'
            },
            priority: 'Priority:',
            filterLabel: "Filter for column: "
          },
          aggregate: {label: 'items'},
          groupPanel: {description: 'Drag a column header here and drop it to group by that column.'},
          search: {
            placeholder: 'Search...',
            showingItems: 'Showing Items:',
            selectedItems: 'Selected Items:',
            totalItems: 'Total Items:',
            size: 'Page Size:',
            first: 'First Page',
            next: 'Next Page',
            previous: 'Previous Page',
            last: 'Last Page'
          },
          menu: {text: 'Choose Columns:'},
          sort: {
            ascending: 'Sort Ascending',
            descending: 'Sort Descending',
            none: 'Sort None',
            remove: 'Remove Sort'
          },
          column: {hide: 'Hide Column'},
          aggregation: {
            count: 'total rows: ',
            sum: 'total: ',
            avg: 'avg: ',
            min: 'min: ',
            max: 'max: '
          },
          pinning: {
            pinLeft: 'Pin Left',
            pinRight: 'Pin Right',
            unpin: 'Unpin'
          },
          columnMenu: {close: 'Close'},
          gridMenu: {
            aria: {buttonLabel: 'Grid Menu'},
            columns: 'Columns:',
            importerTitle: 'Import file',
            exporterAllAsCsv: 'Export all data as csv',
            exporterVisibleAsCsv: 'Export visible data as csv',
            exporterSelectedAsCsv: 'Export selected data as csv',
            exporterAllAsPdf: 'Export all data as pdf',
            exporterVisibleAsPdf: 'Export visible data as pdf',
            exporterSelectedAsPdf: 'Export selected data as pdf',
            clearAllFilters: 'Clear all filters'
          },
          importer: {
            noHeaders: 'Column names were unable to be derived, does the file have a header?',
            noObjects: 'Objects were not able to be derived, was there data in the file other than headers?',
            invalidCsv: 'File was unable to be processed, is it valid CSV?',
            invalidJson: 'File was unable to be processed, is it valid Json?',
            jsonNotArray: 'Imported json file must contain an array, aborting.'
          },
          pagination: {
            aria: {
              pageToFirst: 'Page to first',
              pageBack: 'Page back',
              pageSelected: 'Selected page',
              pageForward: 'Page forward',
              pageToLast: 'Page to last'
            },
            sizes: 'items per page',
            totalItems: 'items',
            through: 'through',
            of: 'of'
          },
          grouping: {
            group: 'Group',
            ungroup: 'Ungroup',
            aggregate_count: 'Agg: Count',
            aggregate_sum: 'Agg: Sum',
            aggregate_max: 'Agg: Max',
            aggregate_min: 'Agg: Min',
            aggregate_avg: 'Agg: Avg',
            aggregate_remove: 'Agg: Remove'
          },
          validate: {
            error: 'Error:',
            minLength: 'Value should be at least THRESHOLD characters long.',
            maxLength: 'Value should be at most THRESHOLD characters long.',
            required: 'A value is needed.'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('es', {
          aggregate: {label: 'Artículos'},
          groupPanel: {description: 'Arrastre un encabezado de columna aquí y suéltelo para agrupar por esa columna.'},
          search: {
            placeholder: 'Buscar...',
            showingItems: 'Artículos Mostrados:',
            selectedItems: 'Artículos Seleccionados:',
            totalItems: 'Artículos Totales:',
            size: 'Tamaño de Página:',
            first: 'Primera Página',
            next: 'Página Siguiente',
            previous: 'Página Anterior',
            last: 'Última Página'
          },
          menu: {text: 'Elegir columnas:'},
          sort: {
            ascending: 'Orden Ascendente',
            descending: 'Orden Descendente',
            remove: 'Sin Ordenar'
          },
          column: {hide: 'Ocultar la columna'},
          aggregation: {
            count: 'filas totales: ',
            sum: 'total: ',
            avg: 'media: ',
            min: 'min: ',
            max: 'max: '
          },
          pinning: {
            pinLeft: 'Fijar a la Izquierda',
            pinRight: 'Fijar a la Derecha',
            unpin: 'Quitar Fijación'
          },
          gridMenu: {
            columns: 'Columnas:',
            importerTitle: 'Importar archivo',
            exporterAllAsCsv: 'Exportar todo como csv',
            exporterVisibleAsCsv: 'Exportar vista como csv',
            exporterSelectedAsCsv: 'Exportar selección como csv',
            exporterAllAsPdf: 'Exportar todo como pdf',
            exporterVisibleAsPdf: 'Exportar vista como pdf',
            exporterSelectedAsPdf: 'Exportar selección como pdf',
            clearAllFilters: 'Limpiar todos los filtros'
          },
          importer: {
            noHeaders: 'No fue posible derivar los nombres de las columnas, ¿tiene encabezados el archivo?',
            noObjects: 'No fue posible obtener registros, ¿contiene datos el archivo, aparte de los encabezados?',
            invalidCsv: 'No fue posible procesar el archivo, ¿es un CSV válido?',
            invalidJson: 'No fue posible procesar el archivo, ¿es un Json válido?',
            jsonNotArray: 'El archivo json importado debe contener un array, abortando.'
          },
          pagination: {
            sizes: 'registros por página',
            totalItems: 'registros',
            of: 'de'
          },
          grouping: {
            group: 'Agrupar',
            ungroup: 'Desagrupar',
            aggregate_count: 'Agr: Cont',
            aggregate_sum: 'Agr: Sum',
            aggregate_max: 'Agr: Máx',
            aggregate_min: 'Agr: Min',
            aggregate_avg: 'Agr: Prom',
            aggregate_remove: 'Agr: Quitar'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('fa', {
          aggregate: {label: 'قلم'},
          groupPanel: {description: 'عنوان یک ستون را بگیر و به گروهی از آن ستون رها کن.'},
          search: {
            placeholder: 'جستجو...',
            showingItems: 'نمایش اقلام:',
            selectedItems: 'قلم\u200cهای انتخاب شده:',
            totalItems: 'مجموع اقلام:',
            size: 'اندازه\u200cی صفحه:',
            first: 'اولین صفحه',
            next: 'صفحه\u200cی\u200cبعدی',
            previous: 'صفحه\u200cی\u200c قبلی',
            last: 'آخرین صفحه'
          },
          menu: {text: 'ستون\u200cهای انتخابی:'},
          sort: {
            ascending: 'ترتیب صعودی',
            descending: 'ترتیب نزولی',
            remove: 'حذف مرتب کردن'
          },
          column: {hide: 'پنهان\u200cکردن ستون'},
          aggregation: {
            count: 'تعداد: ',
            sum: 'مجموع: ',
            avg: 'میانگین: ',
            min: 'کمترین: ',
            max: 'بیشترین: '
          },
          pinning: {
            pinLeft: 'پین کردن سمت چپ',
            pinRight: 'پین کردن سمت راست',
            unpin: 'حذف پین'
          },
          gridMenu: {
            columns: 'ستون\u200cها:',
            importerTitle: 'وارد کردن فایل',
            exporterAllAsCsv: 'خروجی تمام داده\u200cها در فایل csv',
            exporterVisibleAsCsv: 'خروجی داده\u200cهای قابل مشاهده در فایل csv',
            exporterSelectedAsCsv: 'خروجی داده\u200cهای انتخاب\u200cشده در فایل csv',
            exporterAllAsPdf: 'خروجی تمام داده\u200cها در فایل pdf',
            exporterVisibleAsPdf: 'خروجی داده\u200cهای قابل مشاهده در فایل pdf',
            exporterSelectedAsPdf: 'خروجی داده\u200cهای انتخاب\u200cشده در فایل pdf',
            clearAllFilters: 'پاک کردن تمام فیلتر'
          },
          importer: {
            noHeaders: 'نام ستون قابل استخراج نیست. آیا فایل عنوان دارد؟',
            noObjects: 'اشیا قابل استخراج نیستند. آیا به جز عنوان\u200cها در فایل داده وجود دارد؟',
            invalidCsv: 'فایل قابل پردازش نیست. آیا فرمت  csv  معتبر است؟',
            invalidJson: 'فایل قابل پردازش نیست. آیا فرمت json   معتبر است؟',
            jsonNotArray: 'فایل json وارد شده باید حاوی آرایه باشد. عملیات ساقط شد.'
          },
          pagination: {
            sizes: 'اقلام در هر صفحه',
            totalItems: 'اقلام',
            of: 'از'
          },
          grouping: {
            group: 'گروه\u200cبندی',
            ungroup: 'حذف گروه\u200cبندی',
            aggregate_count: 'Agg: تعداد',
            aggregate_sum: 'Agg: جمع',
            aggregate_max: 'Agg: بیشینه',
            aggregate_min: 'Agg: کمینه',
            aggregate_avg: 'Agg: میانگین',
            aggregate_remove: 'Agg: حذف'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('fi', {
          aggregate: {label: 'rivit'},
          groupPanel: {description: 'Raahaa ja pudota otsikko tähän ryhmittääksesi sarakkeen mukaan.'},
          search: {
            placeholder: 'Hae...',
            showingItems: 'Näytetään rivejä:',
            selectedItems: 'Valitut rivit:',
            totalItems: 'Rivejä yht.:',
            size: 'Näytä:',
            first: 'Ensimmäinen sivu',
            next: 'Seuraava sivu',
            previous: 'Edellinen sivu',
            last: 'Viimeinen sivu'
          },
          menu: {text: 'Valitse sarakkeet:'},
          sort: {
            ascending: 'Järjestä nouseva',
            descending: 'Järjestä laskeva',
            remove: 'Poista järjestys'
          },
          column: {hide: 'Piilota sarake'},
          aggregation: {
            count: 'Rivejä yht.: ',
            sum: 'Summa: ',
            avg: 'K.a.: ',
            min: 'Min: ',
            max: 'Max: '
          },
          pinning: {
            pinLeft: 'Lukitse vasemmalle',
            pinRight: 'Lukitse oikealle',
            unpin: 'Poista lukitus'
          },
          gridMenu: {
            columns: 'Sarakkeet:',
            importerTitle: 'Tuo tiedosto',
            exporterAllAsCsv: 'Vie tiedot csv-muodossa',
            exporterVisibleAsCsv: 'Vie näkyvä tieto csv-muodossa',
            exporterSelectedAsCsv: 'Vie valittu tieto csv-muodossa',
            exporterAllAsPdf: 'Vie tiedot pdf-muodossa',
            exporterVisibleAsPdf: 'Vie näkyvä tieto pdf-muodossa',
            exporterSelectedAsPdf: 'Vie valittu tieto pdf-muodossa',
            clearAllFilters: 'Puhdista kaikki suodattimet'
          },
          importer: {
            noHeaders: 'Sarakkeen nimiä ei voitu päätellä, onko tiedostossa otsikkoriviä?',
            noObjects: 'Tietoja ei voitu lukea, onko tiedostossa muuta kuin otsikkot?',
            invalidCsv: 'Tiedostoa ei voitu käsitellä, oliko se CSV-muodossa?',
            invalidJson: 'Tiedostoa ei voitu käsitellä, oliko se JSON-muodossa?',
            jsonNotArray: 'Tiedosto ei sisältänyt taulukkoa, lopetetaan.'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('fr', {
          aggregate: {label: 'éléments'},
          groupPanel: {description: 'Faites glisser une en-tête de colonne ici pour créer un groupe de colonnes.'},
          search: {
            placeholder: 'Recherche...',
            showingItems: 'Affichage des éléments :',
            selectedItems: 'Éléments sélectionnés :',
            totalItems: 'Nombre total d\'éléments:',
            size: 'Taille de page:',
            first: 'Première page',
            next: 'Page Suivante',
            previous: 'Page précédente',
            last: 'Dernière page'
          },
          menu: {text: 'Choisir des colonnes :'},
          sort: {
            ascending: 'Trier par ordre croissant',
            descending: 'Trier par ordre décroissant',
            remove: 'Enlever le tri'
          },
          column: {hide: 'Cacher la colonne'},
          aggregation: {
            count: 'lignes totales: ',
            sum: 'total: ',
            avg: 'moy: ',
            min: 'min: ',
            max: 'max: '
          },
          pinning: {
            pinLeft: 'Épingler à gauche',
            pinRight: 'Épingler à droite',
            unpin: 'Détacher'
          },
          gridMenu: {
            columns: 'Colonnes:',
            importerTitle: 'Importer un fichier',
            exporterAllAsCsv: 'Exporter toutes les données en CSV',
            exporterVisibleAsCsv: 'Exporter les données visibles en CSV',
            exporterSelectedAsCsv: 'Exporter les données sélectionnées en CSV',
            exporterAllAsPdf: 'Exporter toutes les données en PDF',
            exporterVisibleAsPdf: 'Exporter les données visibles en PDF',
            exporterSelectedAsPdf: 'Exporter les données sélectionnées en PDF',
            clearAllFilters: 'Nettoyez tous les filtres'
          },
          importer: {
            noHeaders: 'Impossible de déterminer le nom des colonnes, le fichier possède-t-il une en-tête ?',
            noObjects: 'Aucun objet trouvé, le fichier possède-t-il des données autres que l\'en-tête ?',
            invalidCsv: 'Le fichier n\'a pas pu être traité, le CSV est-il valide ?',
            invalidJson: 'Le fichier n\'a pas pu être traité, le JSON est-il valide ?',
            jsonNotArray: 'Le fichier JSON importé doit contenir un tableau, abandon.'
          },
          pagination: {
            sizes: 'éléments par page',
            totalItems: 'éléments',
            of: 'sur'
          },
          grouping: {
            group: 'Grouper',
            ungroup: 'Dégrouper',
            aggregate_count: 'Agg: Compte',
            aggregate_sum: 'Agg: Somme',
            aggregate_max: 'Agg: Max',
            aggregate_min: 'Agg: Min',
            aggregate_avg: 'Agg: Moy',
            aggregate_remove: 'Agg: Retirer'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('he', {
          aggregate: {label: 'items'},
          groupPanel: {description: 'גרור עמודה לכאן ושחרר בכדי לקבץ עמודה זו.'},
          search: {
            placeholder: 'חפש...',
            showingItems: 'מציג:',
            selectedItems: 'סה"כ נבחרו:',
            totalItems: 'סה"כ רשומות:',
            size: 'תוצאות בדף:',
            first: 'דף ראשון',
            next: 'דף הבא',
            previous: 'דף קודם',
            last: 'דף אחרון'
          },
          menu: {text: 'בחר עמודות:'},
          sort: {
            ascending: 'סדר עולה',
            descending: 'סדר יורד',
            remove: 'בטל'
          },
          column: {hide: 'טור הסתר'},
          aggregation: {
            count: 'total rows: ',
            sum: 'total: ',
            avg: 'avg: ',
            min: 'min: ',
            max: 'max: '
          },
          gridMenu: {
            columns: 'Columns:',
            importerTitle: 'Import file',
            exporterAllAsCsv: 'Export all data as csv',
            exporterVisibleAsCsv: 'Export visible data as csv',
            exporterSelectedAsCsv: 'Export selected data as csv',
            exporterAllAsPdf: 'Export all data as pdf',
            exporterVisibleAsPdf: 'Export visible data as pdf',
            exporterSelectedAsPdf: 'Export selected data as pdf',
            clearAllFilters: 'Clean all filters'
          },
          importer: {
            noHeaders: 'Column names were unable to be derived, does the file have a header?',
            noObjects: 'Objects were not able to be derived, was there data in the file other than headers?',
            invalidCsv: 'File was unable to be processed, is it valid CSV?',
            invalidJson: 'File was unable to be processed, is it valid Json?',
            jsonNotArray: 'Imported json file must contain an array, aborting.'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('hy', {
          aggregate: {label: 'տվյալներ'},
          groupPanel: {description: 'Ըստ սյան խմբավորելու համար քաշեք և գցեք վերնագիրն այստեղ։'},
          search: {
            placeholder: 'Փնտրում...',
            showingItems: 'Ցուցադրված տվյալներ՝',
            selectedItems: 'Ընտրված:',
            totalItems: 'Ընդամենը՝',
            size: 'Տողերի քանակը էջում՝',
            first: 'Առաջին էջ',
            next: 'Հաջորդ էջ',
            previous: 'Նախորդ էջ',
            last: 'Վերջին էջ'
          },
          menu: {text: 'Ընտրել սյուները:'},
          sort: {
            ascending: 'Աճման կարգով',
            descending: 'Նվազման կարգով',
            remove: 'Հանել '
          },
          column: {hide: 'Թաքցնել սյունը'},
          aggregation: {
            count: 'ընդամենը տող՝ ',
            sum: 'ընդամենը՝ ',
            avg: 'միջին՝ ',
            min: 'մին՝ ',
            max: 'մաքս՝ '
          },
          pinning: {
            pinLeft: 'Կպցնել ձախ կողմում',
            pinRight: 'Կպցնել աջ կողմում',
            unpin: 'Արձակել'
          },
          gridMenu: {
            columns: 'Սյուներ:',
            importerTitle: 'Ներմուծել ֆայլ',
            exporterAllAsCsv: 'Արտահանել ամբողջը CSV',
            exporterVisibleAsCsv: 'Արտահանել երևացող տվյալները CSV',
            exporterSelectedAsCsv: 'Արտահանել ընտրված տվյալները CSV',
            exporterAllAsPdf: 'Արտահանել PDF',
            exporterVisibleAsPdf: 'Արտահանել երևացող տվյալները PDF',
            exporterSelectedAsPdf: 'Արտահանել ընտրված տվյալները PDF',
            clearAllFilters: 'Մաքրել բոլոր ֆիլտրերը'
          },
          importer: {
            noHeaders: 'Հնարավոր չեղավ որոշել սյան վերնագրերը։ Արդյո՞ք ֆայլը ունի վերնագրեր։',
            noObjects: 'Հնարավոր չեղավ կարդալ տվյալները։ Արդյո՞ք ֆայլում կան տվյալներ։',
            invalidCsv: 'Հնարավոր չեղավ մշակել ֆայլը։ Արդյո՞ք այն վավեր CSV է։',
            invalidJson: 'Հնարավոր չեղավ մշակել ֆայլը։ Արդյո՞ք այն վավեր Json է։',
            jsonNotArray: 'Ներմուծված json ֆայլը պետք է պարունակի զանգված, կասեցվում է։'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('it', {
          aggregate: {label: 'elementi'},
          groupPanel: {description: 'Trascina un\'intestazione all\'interno del gruppo della colonna.'},
          search: {
            placeholder: 'Ricerca...',
            showingItems: 'Mostra:',
            selectedItems: 'Selezionati:',
            totalItems: 'Totali:',
            size: 'Tot Pagine:',
            first: 'Prima',
            next: 'Prossima',
            previous: 'Precedente',
            last: 'Ultima'
          },
          menu: {text: 'Scegli le colonne:'},
          sort: {
            ascending: 'Asc.',
            descending: 'Desc.',
            remove: 'Annulla ordinamento'
          },
          column: {hide: 'Nascondi'},
          aggregation: {
            count: 'righe totali: ',
            sum: 'tot: ',
            avg: 'media: ',
            min: 'minimo: ',
            max: 'massimo: '
          },
          pinning: {
            pinLeft: 'Blocca a sx',
            pinRight: 'Blocca a dx',
            unpin: 'Blocca in alto'
          },
          gridMenu: {
            columns: 'Colonne:',
            importerTitle: 'Importa',
            exporterAllAsCsv: 'Esporta tutti i dati in CSV',
            exporterVisibleAsCsv: 'Esporta i dati visibili in CSV',
            exporterSelectedAsCsv: 'Esporta i dati selezionati in CSV',
            exporterAllAsPdf: 'Esporta tutti i dati in PDF',
            exporterVisibleAsPdf: 'Esporta i dati visibili in PDF',
            exporterSelectedAsPdf: 'Esporta i dati selezionati in PDF',
            clearAllFilters: 'Pulire tutti i filtri'
          },
          importer: {
            noHeaders: 'Impossibile reperire i nomi delle colonne, sicuro che siano indicati all\'interno del file?',
            noObjects: 'Impossibile reperire gli oggetti, sicuro che siano indicati all\'interno del file?',
            invalidCsv: 'Impossibile elaborare il file, sicuro che sia un CSV?',
            invalidJson: 'Impossibile elaborare il file, sicuro che sia un JSON valido?',
            jsonNotArray: 'Errore! Il file JSON da importare deve contenere un array.'
          },
          grouping: {
            group: 'Raggruppa',
            ungroup: 'Separa',
            aggregate_count: 'Agg: N. Elem.',
            aggregate_sum: 'Agg: Somma',
            aggregate_max: 'Agg: Massimo',
            aggregate_min: 'Agg: Minimo',
            aggregate_avg: 'Agg: Media',
            aggregate_remove: 'Agg: Rimuovi'
          },
          validate: {
            error: 'Errore:',
            minLength: 'Lunghezza minima pari a THRESHOLD caratteri.',
            maxLength: 'Lunghezza massima pari a THRESHOLD caratteri.',
            required: 'Necessario inserire un valore.'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('ja', {
          aggregate: {label: '項目'},
          groupPanel: {description: 'ここに列ヘッダをドラッグアンドドロップして、その列でグループ化します。'},
          search: {
            placeholder: '検索...',
            showingItems: '表示中の項目:',
            selectedItems: '選択した項目:',
            totalItems: '項目の総数:',
            size: 'ページサイズ:',
            first: '最初のページ',
            next: '次のページ',
            previous: '前のページ',
            last: '前のページ'
          },
          menu: {text: '列の選択:'},
          sort: {
            ascending: '昇順に並べ替え',
            descending: '降順に並べ替え',
            remove: '並べ替えの解除'
          },
          column: {hide: '列の非表示'},
          aggregation: {
            count: '合計行数: ',
            sum: '合計: ',
            avg: '平均: ',
            min: '最小: ',
            max: '最大: '
          },
          pinning: {
            pinLeft: '左に固定',
            pinRight: '右に固定',
            unpin: '固定解除'
          },
          gridMenu: {
            columns: '列:',
            importerTitle: 'ファイルのインポート',
            exporterAllAsCsv: 'すべてのデータをCSV形式でエクスポート',
            exporterVisibleAsCsv: '表示中のデータをCSV形式でエクスポート',
            exporterSelectedAsCsv: '選択したデータをCSV形式でエクスポート',
            exporterAllAsPdf: 'すべてのデータをPDF形式でエクスポート',
            exporterVisibleAsPdf: '表示中のデータをPDF形式でエクスポート',
            exporterSelectedAsPdf: '選択したデータをPDF形式でエクスポート',
            clearAllFilters: 'すべてのフィルタを清掃してください'
          },
          importer: {
            noHeaders: '列名を取得できません。ファイルにヘッダが含まれていることを確認してください。',
            noObjects: 'オブジェクトを取得できません。ファイルにヘッダ以外のデータが含まれていることを確認してください。',
            invalidCsv: 'ファイルを処理できません。ファイルが有効なCSV形式であることを確認してください。',
            invalidJson: 'ファイルを処理できません。ファイルが有効なJSON形式であることを確認してください。',
            jsonNotArray: 'インポートしたJSONファイルには配列が含まれている必要があります。処理を中止します。'
          },
          pagination: {
            aria: {
              pageToFirst: '最初のページ',
              pageBack: '前のページ',
              pageSelected: '現在のページ',
              pageForward: '次のページ',
              pageToLast: '最後のページ'
            },
            sizes: '項目/ページ',
            totalItems: '項目',
            through: 'から',
            of: '項目/全'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('ko', {
          aggregate: {label: '아이템'},
          groupPanel: {description: '컬럼으로 그룹핑하기 위해서는 컬럼 헤더를 끌어 떨어뜨려 주세요.'},
          search: {
            placeholder: '검색...',
            showingItems: '항목 보여주기:',
            selectedItems: '선택 항목:',
            totalItems: '전체 항목:',
            size: '페이지 크기:',
            first: '첫번째 페이지',
            next: '다음 페이지',
            previous: '이전 페이지',
            last: '마지막 페이지'
          },
          menu: {text: '컬럼을 선택하세요:'},
          sort: {
            ascending: '오름차순 정렬',
            descending: '내림차순 정렬',
            remove: '소팅 제거'
          },
          column: {hide: '컬럼 제거'},
          aggregation: {
            count: '전체 갯수: ',
            sum: '전체: ',
            avg: '평균: ',
            min: '최소: ',
            max: '최대: '
          },
          pinning: {
            pinLeft: '왼쪽 핀',
            pinRight: '오른쪽 핀',
            unpin: '핀 제거'
          },
          gridMenu: {
            columns: '컬럼:',
            importerTitle: '파일 가져오기',
            exporterAllAsCsv: 'csv로 모든 데이터 내보내기',
            exporterVisibleAsCsv: 'csv로 보이는 데이터 내보내기',
            exporterSelectedAsCsv: 'csv로 선택된 데이터 내보내기',
            exporterAllAsPdf: 'pdf로 모든 데이터 내보내기',
            exporterVisibleAsPdf: 'pdf로 보이는 데이터 내보내기',
            exporterSelectedAsPdf: 'pdf로 선택 데이터 내보내기',
            clearAllFilters: '모든 필터를 청소'
          },
          importer: {
            noHeaders: '컬럼명이 지정되어 있지 않습니다. 파일에 헤더가 명시되어 있는지 확인해 주세요.',
            noObjects: '데이터가 지정되어 있지 않습니다. 데이터가 파일에 있는지 확인해 주세요.',
            invalidCsv: '파일을 처리할 수 없습니다. 올바른 csv인지 확인해 주세요.',
            invalidJson: '파일을 처리할 수 없습니다. 올바른 json인지 확인해 주세요.',
            jsonNotArray: 'json 파일은 배열을 포함해야 합니다.'
          },
          pagination: {
            sizes: '페이지당 항목',
            totalItems: '전체 항목'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('nl', {
          aggregate: {label: 'items'},
          groupPanel: {description: 'Sleep hier een kolomnaam heen om op te groeperen.'},
          search: {
            placeholder: 'Zoeken...',
            showingItems: 'Getoonde items:',
            selectedItems: 'Geselecteerde items:',
            totalItems: 'Totaal aantal items:',
            size: 'Items per pagina:',
            first: 'Eerste pagina',
            next: 'Volgende pagina',
            previous: 'Vorige pagina',
            last: 'Laatste pagina'
          },
          menu: {text: 'Kies kolommen:'},
          sort: {
            ascending: 'Sorteer oplopend',
            descending: 'Sorteer aflopend',
            remove: 'Verwijder sortering'
          },
          column: {hide: 'Verberg kolom'},
          aggregation: {
            count: 'Aantal rijen: ',
            sum: 'Som: ',
            avg: 'Gemiddelde: ',
            min: 'Min: ',
            max: 'Max: '
          },
          pinning: {
            pinLeft: 'Zet links vast',
            pinRight: 'Zet rechts vast',
            unpin: 'Maak los'
          },
          gridMenu: {
            columns: 'Kolommen:',
            importerTitle: 'Importeer bestand',
            exporterAllAsCsv: 'Exporteer alle data als csv',
            exporterVisibleAsCsv: 'Exporteer zichtbare data als csv',
            exporterSelectedAsCsv: 'Exporteer geselecteerde data als csv',
            exporterAllAsPdf: 'Exporteer alle data als pdf',
            exporterVisibleAsPdf: 'Exporteer zichtbare data als pdf',
            exporterSelectedAsPdf: 'Exporteer geselecteerde data als pdf',
            clearAllFilters: 'Reinig alle filters'
          },
          importer: {
            noHeaders: 'Kolomnamen kunnen niet worden afgeleid. Heeft het bestand een header?',
            noObjects: 'Objecten kunnen niet worden afgeleid. Bevat het bestand data naast de headers?',
            invalidCsv: 'Het bestand kan niet verwerkt worden. Is het een valide csv bestand?',
            invalidJson: 'Het bestand kan niet verwerkt worden. Is het valide json?',
            jsonNotArray: 'Het json bestand moet een array bevatten. De actie wordt geannuleerd.'
          },
          pagination: {
            sizes: 'items per pagina',
            totalItems: 'items',
            of: 'van de'
          },
          grouping: {
            group: 'Groepeer',
            ungroup: 'Groepering opheffen',
            aggregate_count: 'Agg: Aantal',
            aggregate_sum: 'Agg: Som',
            aggregate_max: 'Agg: Max',
            aggregate_min: 'Agg: Min',
            aggregate_avg: 'Agg: Gem',
            aggregate_remove: 'Agg: Verwijder'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('pl', {
          headerCell: {
            aria: {
              defaultFilterLabel: 'Filter dla kolumny',
              removeFilter: 'Usuń filter',
              columnMenuButtonLabel: 'Menu kolumny'
            },
            priority: 'Prioritet:',
            filterLabel: "Filtr dla kolumny: "
          },
          aggregate: {label: 'pozycji'},
          groupPanel: {description: 'Przeciągnij nagłówek kolumny tutaj, aby pogrupować według niej.'},
          search: {
            placeholder: 'Szukaj...',
            showingItems: 'Widoczne pozycje:',
            selectedItems: 'Zaznaczone pozycje:',
            totalItems: 'Wszystkich pozycji:',
            size: 'Rozmiar strony:',
            first: 'Pierwsza strona',
            next: 'Następna strona',
            previous: 'Poprzednia strona',
            last: 'Ostatnia strona'
          },
          menu: {text: 'Wybierz kolumny:'},
          sort: {
            ascending: 'Sortuj rosnąco',
            descending: 'Sortuj malejąco',
            none: 'Brak sortowania',
            remove: 'Wyłącz sortowanie'
          },
          column: {hide: 'Ukryj kolumne'},
          aggregation: {
            count: 'Razem pozycji: ',
            sum: 'Razem: ',
            avg: 'Średnia: ',
            min: 'Min: ',
            max: 'Max: '
          },
          pinning: {
            pinLeft: 'Przypnij do lewej',
            pinRight: 'Przypnij do prawej',
            unpin: 'Odepnij'
          },
          columnMenu: {close: 'Zamknij'},
          gridMenu: {
            aria: {buttonLabel: 'Menu Grida'},
            columns: 'Kolumny:',
            importerTitle: 'Importuj plik',
            exporterAllAsCsv: 'Eksportuj wszystkie dane do csv',
            exporterVisibleAsCsv: 'Eksportuj widoczne dane do csv',
            exporterSelectedAsCsv: 'Eksportuj zaznaczone dane do csv',
            exporterAllAsPdf: 'Eksportuj wszystkie dane do pdf',
            exporterVisibleAsPdf: 'Eksportuj widoczne dane do pdf',
            exporterSelectedAsPdf: 'Eksportuj zaznaczone dane do pdf',
            clearAllFilters: 'Wyczyść filtry'
          },
          importer: {
            noHeaders: 'Nie udało się wczytać nazw kolumn. Czy plik posiada nagłówek?',
            noObjects: 'Nie udalo się wczytać pozycji. Czy plik zawiera dane??',
            invalidCsv: 'Nie udało się przetworzyć pliku, jest to prawidlowy plik CSV??',
            invalidJson: 'Nie udało się przetworzyć pliku, jest to prawidlowy plik Json?',
            jsonNotArray: 'Importowany plik json musi zawierać tablicę, importowanie przerwane.'
          },
          pagination: {
            aria: {
              pageToFirst: 'Pierwsza strona',
              pageBack: 'Poprzednia strona',
              pageSelected: 'Wybrana strona',
              pageForward: 'Następna strona',
              pageToLast: 'Ostatnia strona'
            },
            sizes: 'pozycji na stronę',
            totalItems: 'pozycji',
            through: 'do',
            of: 'z'
          },
          grouping: {
            group: 'Grupuj',
            ungroup: 'Rozgrupuj',
            aggregate_count: 'Zbiorczo: Razem',
            aggregate_sum: 'Zbiorczo: Suma',
            aggregate_max: 'Zbiorczo: Max',
            aggregate_min: 'Zbiorczo: Min',
            aggregate_avg: 'Zbiorczo: Średnia',
            aggregate_remove: 'Zbiorczo: Usuń'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('pt-br', {
          headerCell: {
            aria: {
              defaultFilterLabel: 'Filtro por coluna',
              removeFilter: 'Remover filtro',
              columnMenuButtonLabel: 'Menu coluna'
            },
            priority: 'Prioridade:',
            filterLabel: "Filtro por coluna: "
          },
          aggregate: {label: 'itens'},
          groupPanel: {description: 'Arraste e solte uma coluna aqui para agrupar por essa coluna'},
          search: {
            placeholder: 'Procurar...',
            showingItems: 'Mostrando os Itens:',
            selectedItems: 'Items Selecionados:',
            totalItems: 'Total de Itens:',
            size: 'Tamanho da Página:',
            first: 'Primeira Página',
            next: 'Próxima Página',
            previous: 'Página Anterior',
            last: 'Última Página'
          },
          menu: {text: 'Selecione as colunas:'},
          sort: {
            ascending: 'Ordenar Ascendente',
            descending: 'Ordenar Descendente',
            none: 'Nenhuma Ordem',
            remove: 'Remover Ordenação'
          },
          column: {hide: 'Esconder coluna'},
          aggregation: {
            count: 'total de linhas: ',
            sum: 'total: ',
            avg: 'med: ',
            min: 'min: ',
            max: 'max: '
          },
          pinning: {
            pinLeft: 'Fixar Esquerda',
            pinRight: 'Fixar Direita',
            unpin: 'Desprender'
          },
          columnMenu: {close: 'Fechar'},
          gridMenu: {
            aria: {buttonLabel: 'Menu Grid'},
            columns: 'Colunas:',
            importerTitle: 'Importar arquivo',
            exporterAllAsCsv: 'Exportar todos os dados como csv',
            exporterVisibleAsCsv: 'Exportar dados visíveis como csv',
            exporterSelectedAsCsv: 'Exportar dados selecionados como csv',
            exporterAllAsPdf: 'Exportar todos os dados como pdf',
            exporterVisibleAsPdf: 'Exportar dados visíveis como pdf',
            exporterSelectedAsPdf: 'Exportar dados selecionados como pdf',
            clearAllFilters: 'Limpar todos os filtros'
          },
          importer: {
            noHeaders: 'Nomes de colunas não puderam ser derivados. O arquivo tem um cabeçalho?',
            noObjects: 'Objetos não puderam ser derivados. Havia dados no arquivo, além dos cabeçalhos?',
            invalidCsv: 'Arquivo não pode ser processado. É um CSV válido?',
            invalidJson: 'Arquivo não pode ser processado. É um Json válido?',
            jsonNotArray: 'Arquivo json importado tem que conter um array. Abortando.'
          },
          pagination: {
            aria: {
              pageToFirst: 'Primeira página',
              pageBack: 'Página anterior',
              pageSelected: 'Página Selecionada',
              pageForward: 'Proxima',
              pageToLast: 'Anterior'
            },
            sizes: 'itens por página',
            totalItems: 'itens',
            through: 'através dos',
            of: 'de'
          },
          grouping: {
            group: 'Agrupar',
            ungroup: 'Desagrupar',
            aggregate_count: 'Agr: Contar',
            aggregate_sum: 'Agr: Soma',
            aggregate_max: 'Agr: Max',
            aggregate_min: 'Agr: Min',
            aggregate_avg: 'Agr: Med',
            aggregate_remove: 'Agr: Remover'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('pt', {
          headerCell: {
            aria: {
              defaultFilterLabel: 'Filtro por coluna',
              removeFilter: 'Remover filtro',
              columnMenuButtonLabel: 'Menu coluna'
            },
            priority: 'Prioridade:',
            filterLabel: "Filtro por coluna: "
          },
          aggregate: {label: 'itens'},
          groupPanel: {description: 'Arraste e solte uma coluna aqui para agrupar por essa coluna'},
          search: {
            placeholder: 'Procurar...',
            showingItems: 'Mostrando os Itens:',
            selectedItems: 'Itens Selecionados:',
            totalItems: 'Total de Itens:',
            size: 'Tamanho da Página:',
            first: 'Primeira Página',
            next: 'Próxima Página',
            previous: 'Página Anterior',
            last: 'Última Página'
          },
          menu: {text: 'Selecione as colunas:'},
          sort: {
            ascending: 'Ordenar Ascendente',
            descending: 'Ordenar Descendente',
            none: 'Nenhuma Ordem',
            remove: 'Remover Ordenação'
          },
          column: {hide: 'Esconder coluna'},
          aggregation: {
            count: 'total de linhas: ',
            sum: 'total: ',
            avg: 'med: ',
            min: 'min: ',
            max: 'max: '
          },
          pinning: {
            pinLeft: 'Fixar Esquerda',
            pinRight: 'Fixar Direita',
            unpin: 'Desprender'
          },
          columnMenu: {close: 'Fechar'},
          gridMenu: {
            aria: {buttonLabel: 'Menu Grid'},
            columns: 'Colunas:',
            importerTitle: 'Importar ficheiro',
            exporterAllAsCsv: 'Exportar todos os dados como csv',
            exporterVisibleAsCsv: 'Exportar dados visíveis como csv',
            exporterSelectedAsCsv: 'Exportar dados selecionados como csv',
            exporterAllAsPdf: 'Exportar todos os dados como pdf',
            exporterVisibleAsPdf: 'Exportar dados visíveis como pdf',
            exporterSelectedAsPdf: 'Exportar dados selecionados como pdf',
            clearAllFilters: 'Limpar todos os filtros'
          },
          importer: {
            noHeaders: 'Nomes de colunas não puderam ser derivados. O ficheiro tem um cabeçalho?',
            noObjects: 'Objetos não puderam ser derivados. Havia dados no ficheiro, além dos cabeçalhos?',
            invalidCsv: 'Ficheiro não pode ser processado. É um CSV válido?',
            invalidJson: 'Ficheiro não pode ser processado. É um Json válido?',
            jsonNotArray: 'Ficheiro json importado tem que conter um array. Interrompendo.'
          },
          pagination: {
            aria: {
              pageToFirst: 'Primeira página',
              pageBack: 'Página anterior',
              pageSelected: 'Página Selecionada',
              pageForward: 'Próxima',
              pageToLast: 'Anterior'
            },
            sizes: 'itens por página',
            totalItems: 'itens',
            through: 'através dos',
            of: 'de'
          },
          grouping: {
            group: 'Agrupar',
            ungroup: 'Desagrupar',
            aggregate_count: 'Agr: Contar',
            aggregate_sum: 'Agr: Soma',
            aggregate_max: 'Agr: Max',
            aggregate_min: 'Agr: Min',
            aggregate_avg: 'Agr: Med',
            aggregate_remove: 'Agr: Remover'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('ro', {
          headerCell: {
            aria: {
              defaultFilterLabel: 'Filtru pentru coloana',
              removeFilter: 'Sterge filtru',
              columnMenuButtonLabel: 'Column Menu'
            },
            priority: 'Prioritate:',
            filterLabel: "Filtru pentru coloana:"
          },
          aggregate: {label: 'Elemente'},
          groupPanel: {description: 'Trage un cap de coloana aici pentru a grupa elementele dupa coloana respectiva'},
          search: {
            placeholder: 'Cauta...',
            showingItems: 'Arata elementele:',
            selectedItems: 'Elementele selectate:',
            totalItems: 'Total elemente:',
            size: 'Marime pagina:',
            first: 'Prima pagina',
            next: 'Pagina urmatoare',
            previous: 'Pagina anterioara',
            last: 'Ultima pagina'
          },
          menu: {text: 'Alege coloane:'},
          sort: {
            ascending: 'Ordoneaza crescator',
            descending: 'Ordoneaza descrescator',
            none: 'Fara ordonare',
            remove: 'Sterge ordonarea'
          },
          column: {hide: 'Ascunde coloana'},
          aggregation: {
            count: 'total linii: ',
            sum: 'total: ',
            avg: 'medie: ',
            min: 'min: ',
            max: 'max: '
          },
          pinning: {
            pinLeft: 'Pin la stanga',
            pinRight: 'Pin la dreapta',
            unpin: 'Sterge pinul'
          },
          columnMenu: {close: 'Inchide'},
          gridMenu: {
            aria: {buttonLabel: 'Grid Menu'},
            columns: 'Coloane:',
            importerTitle: 'Incarca fisier',
            exporterAllAsCsv: 'Exporta toate datele ca csv',
            exporterVisibleAsCsv: 'Exporta datele vizibile ca csv',
            exporterSelectedAsCsv: 'Exporta datele selectate ca csv',
            exporterAllAsPdf: 'Exporta toate datele ca pdf',
            exporterVisibleAsPdf: 'Exporta datele vizibile ca pdf',
            exporterSelectedAsPdf: 'Exporta datele selectate ca csv pdf',
            clearAllFilters: 'Sterge toate filtrele'
          },
          importer: {
            noHeaders: 'Numele coloanelor nu a putut fi incarcat, acest fisier are un header?',
            noObjects: 'Datele nu au putut fi incarcate, exista date in fisier in afara numelor de coloane?',
            invalidCsv: 'Fisierul nu a putut fi procesat, ati incarcat un CSV valid ?',
            invalidJson: 'Fisierul nu a putut fi procesat, ati incarcat un Json valid?',
            jsonNotArray: 'Json-ul incarcat trebuie sa contina un array, inchidere.'
          },
          pagination: {
            aria: {
              pageToFirst: 'Prima pagina',
              pageBack: 'O pagina inapoi',
              pageSelected: 'Pagina selectata',
              pageForward: 'O pagina inainte',
              pageToLast: 'Ultima pagina'
            },
            sizes: 'Elemente per pagina',
            totalItems: 'elemente',
            through: 'prin',
            of: 'of'
          },
          grouping: {
            group: 'Grupeaza',
            ungroup: 'Opreste gruparea',
            aggregate_count: 'Agg: Count',
            aggregate_sum: 'Agg: Sum',
            aggregate_max: 'Agg: Max',
            aggregate_min: 'Agg: Min',
            aggregate_avg: 'Agg: Avg',
            aggregate_remove: 'Agg: Remove'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('ru', {
          headerCell: {
            aria: {
              defaultFilterLabel: 'Фильтр столбца',
              removeFilter: 'Удалить фильтр',
              columnMenuButtonLabel: 'Меню столбца'
            },
            priority: 'Приоритет:',
            filterLabel: "Фильтр столбца: "
          },
          aggregate: {label: 'элементы'},
          groupPanel: {description: 'Для группировки по столбцу перетащите сюда его название.'},
          search: {
            placeholder: 'Поиск...',
            showingItems: 'Показать элементы:',
            selectedItems: 'Выбранные элементы:',
            totalItems: 'Всего элементов:',
            size: 'Размер страницы:',
            first: 'Первая страница',
            next: 'Следующая страница',
            previous: 'Предыдущая страница',
            last: 'Последняя страница'
          },
          menu: {text: 'Выбрать столбцы:'},
          sort: {
            ascending: 'По возрастанию',
            descending: 'По убыванию',
            none: 'Без сортировки',
            remove: 'Убрать сортировку'
          },
          column: {hide: 'Спрятать столбец'},
          aggregation: {
            count: 'всего строк: ',
            sum: 'итого: ',
            avg: 'среднее: ',
            min: 'мин: ',
            max: 'макс: '
          },
          pinning: {
            pinLeft: 'Закрепить слева',
            pinRight: 'Закрепить справа',
            unpin: 'Открепить'
          },
          columnMenu: {close: 'Закрыть'},
          gridMenu: {
            aria: {buttonLabel: 'Меню'},
            columns: 'Столбцы:',
            importerTitle: 'Импортировать файл',
            exporterAllAsCsv: 'Экспортировать всё в CSV',
            exporterVisibleAsCsv: 'Экспортировать видимые данные в CSV',
            exporterSelectedAsCsv: 'Экспортировать выбранные данные в CSV',
            exporterAllAsPdf: 'Экспортировать всё в PDF',
            exporterVisibleAsPdf: 'Экспортировать видимые данные в PDF',
            exporterSelectedAsPdf: 'Экспортировать выбранные данные в PDF',
            clearAllFilters: 'Очистите все фильтры'
          },
          importer: {
            noHeaders: 'Не удалось получить названия столбцов, есть ли в файле заголовок?',
            noObjects: 'Не удалось получить данные, есть ли в файле строки кроме заголовка?',
            invalidCsv: 'Не удалось обработать файл, это правильный CSV-файл?',
            invalidJson: 'Не удалось обработать файл, это правильный JSON?',
            jsonNotArray: 'Импортируемый JSON-файл должен содержать массив, операция отменена.'
          },
          pagination: {
            aria: {
              pageToFirst: 'Первая страница',
              pageBack: 'Предыдущая страница',
              pageSelected: 'Выбранная страница',
              pageForward: 'Следующая страница',
              pageToLast: 'Последняя страница'
            },
            sizes: 'строк на страницу',
            totalItems: 'строк',
            through: 'по',
            of: 'из'
          },
          grouping: {
            group: 'Группировать',
            ungroup: 'Разгруппировать',
            aggregate_count: 'Группировать: Count',
            aggregate_sum: 'Для группы: Сумма',
            aggregate_max: 'Для группы: Максимум',
            aggregate_min: 'Для группы: Минимум',
            aggregate_avg: 'Для группы: Среднее',
            aggregate_remove: 'Для группы: Пусто'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('sk', {
          aggregate: {label: 'items'},
          groupPanel: {description: 'Pretiahni sem názov stĺpca pre zoskupenie podľa toho stĺpca.'},
          search: {
            placeholder: 'Hľadaj...',
            showingItems: 'Zobrazujem položky:',
            selectedItems: 'Vybraté položky:',
            totalItems: 'Počet položiek:',
            size: 'Počet:',
            first: 'Prvá strana',
            next: 'Ďalšia strana',
            previous: 'Predchádzajúca strana',
            last: 'Posledná strana'
          },
          menu: {text: 'Vyberte stĺpce:'},
          sort: {
            ascending: 'Zotriediť vzostupne',
            descending: 'Zotriediť zostupne',
            remove: 'Vymazať triedenie'
          },
          aggregation: {
            count: 'total rows: ',
            sum: 'total: ',
            avg: 'avg: ',
            min: 'min: ',
            max: 'max: '
          },
          gridMenu: {
            columns: 'Columns:',
            importerTitle: 'Import file',
            exporterAllAsCsv: 'Export all data as csv',
            exporterVisibleAsCsv: 'Export visible data as csv',
            exporterSelectedAsCsv: 'Export selected data as csv',
            exporterAllAsPdf: 'Export all data as pdf',
            exporterVisibleAsPdf: 'Export visible data as pdf',
            exporterSelectedAsPdf: 'Export selected data as pdf',
            clearAllFilters: 'Clear all filters'
          },
          importer: {
            noHeaders: 'Column names were unable to be derived, does the file have a header?',
            noObjects: 'Objects were not able to be derived, was there data in the file other than headers?',
            invalidCsv: 'File was unable to be processed, is it valid CSV?',
            invalidJson: 'File was unable to be processed, is it valid Json?',
            jsonNotArray: 'Imported json file must contain an array, aborting.'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('sv', {
          aggregate: {label: 'Artiklar'},
          groupPanel: {description: 'Dra en kolumnrubrik hit och släpp den för att gruppera efter den kolumnen.'},
          search: {
            placeholder: 'Sök...',
            showingItems: 'Visar artiklar:',
            selectedItems: 'Valda artiklar:',
            totalItems: 'Antal artiklar:',
            size: 'Sidstorlek:',
            first: 'Första sidan',
            next: 'Nästa sida',
            previous: 'Föregående sida',
            last: 'Sista sidan'
          },
          menu: {text: 'Välj kolumner:'},
          sort: {
            ascending: 'Sortera stigande',
            descending: 'Sortera fallande',
            remove: 'Inaktivera sortering'
          },
          column: {hide: 'Göm kolumn'},
          aggregation: {
            count: 'Antal rader: ',
            sum: 'Summa: ',
            avg: 'Genomsnitt: ',
            min: 'Min: ',
            max: 'Max: '
          },
          pinning: {
            pinLeft: 'Fäst vänster',
            pinRight: 'Fäst höger',
            unpin: 'Lösgör'
          },
          gridMenu: {
            columns: 'Kolumner:',
            importerTitle: 'Importera fil',
            exporterAllAsCsv: 'Exportera all data som CSV',
            exporterVisibleAsCsv: 'Exportera synlig data som CSV',
            exporterSelectedAsCsv: 'Exportera markerad data som CSV',
            exporterAllAsPdf: 'Exportera all data som PDF',
            exporterVisibleAsPdf: 'Exportera synlig data som PDF',
            exporterSelectedAsPdf: 'Exportera markerad data som PDF',
            clearAllFilters: 'Rengör alla filter'
          },
          importer: {
            noHeaders: 'Kolumnnamn kunde inte härledas. Har filen ett sidhuvud?',
            noObjects: 'Objekt kunde inte härledas. Har filen data undantaget sidhuvud?',
            invalidCsv: 'Filen kunde inte behandlas, är den en giltig CSV?',
            invalidJson: 'Filen kunde inte behandlas, är den en giltig JSON?',
            jsonNotArray: 'Importerad JSON-fil måste innehålla ett fält. Import avbruten.'
          },
          pagination: {
            sizes: 'Artiklar per sida',
            totalItems: 'Artiklar'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('ta', {
          aggregate: {label: 'உருப்படிகள்'},
          groupPanel: {description: 'ஒரு பத்தியை குழுவாக அமைக்க அப்பத்தியின் தலைப்பை இங்கே  இழுத்து வரவும் '},
          search: {
            placeholder: 'தேடல் ...',
            showingItems: 'உருப்படிகளை காண்பித்தல்:',
            selectedItems: 'தேர்ந்தெடுக்கப்பட்ட  உருப்படிகள்:',
            totalItems: 'மொத்த உருப்படிகள்:',
            size: 'பக்க அளவு: ',
            first: 'முதல் பக்கம்',
            next: 'அடுத்த பக்கம்',
            previous: 'முந்தைய பக்கம் ',
            last: 'இறுதி பக்கம்'
          },
          menu: {text: 'பத்திகளை தேர்ந்தெடு:'},
          sort: {
            ascending: 'மேலிருந்து கீழாக',
            descending: 'கீழிருந்து மேலாக',
            remove: 'வரிசையை நீக்கு'
          },
          column: {hide: 'பத்தியை மறைத்து வை '},
          aggregation: {
            count: 'மொத்த வரிகள்:',
            sum: 'மொத்தம்: ',
            avg: 'சராசரி: ',
            min: 'குறைந்தபட்ச: ',
            max: 'அதிகபட்ச: '
          },
          pinning: {
            pinLeft: 'இடதுபுறமாக தைக்க ',
            pinRight: 'வலதுபுறமாக தைக்க',
            unpin: 'பிரி'
          },
          gridMenu: {
            columns: 'பத்திகள்:',
            importerTitle: 'கோப்பு : படித்தல்',
            exporterAllAsCsv: 'எல்லா தரவுகளையும் கோப்பாக்கு: csv',
            exporterVisibleAsCsv: 'இருக்கும் தரவுகளை கோப்பாக்கு: csv',
            exporterSelectedAsCsv: 'தேர்ந்தெடுத்த தரவுகளை கோப்பாக்கு: csv',
            exporterAllAsPdf: 'எல்லா தரவுகளையும் கோப்பாக்கு: pdf',
            exporterVisibleAsPdf: 'இருக்கும் தரவுகளை கோப்பாக்கு: pdf',
            exporterSelectedAsPdf: 'தேர்ந்தெடுத்த தரவுகளை கோப்பாக்கு: pdf',
            clearAllFilters: 'Clear all filters'
          },
          importer: {
            noHeaders: 'பத்தியின் தலைப்புகளை பெற இயலவில்லை, கோப்பிற்கு தலைப்பு உள்ளதா?',
            noObjects: 'இலக்குகளை உருவாக்க முடியவில்லை, கோப்பில் தலைப்புகளை தவிர தரவு ஏதேனும் உள்ளதா? ',
            invalidCsv: 'சரிவர நடைமுறை படுத்த இயலவில்லை, கோப்பு சரிதானா? - csv',
            invalidJson: 'சரிவர நடைமுறை படுத்த இயலவில்லை, கோப்பு சரிதானா? - json',
            jsonNotArray: 'படித்த கோப்பில் வரிசைகள் உள்ளது, நடைமுறை ரத்து செய் : json'
          },
          pagination: {
            sizes: 'உருப்படிகள் / பக்கம்',
            totalItems: 'உருப்படிகள் '
          },
          grouping: {
            group: 'குழு',
            ungroup: 'பிரி',
            aggregate_count: 'மதிப்பீட்டு : எண்ணு',
            aggregate_sum: 'மதிப்பீட்டு : கூட்டல்',
            aggregate_max: 'மதிப்பீட்டு : அதிகபட்சம்',
            aggregate_min: 'மதிப்பீட்டு : குறைந்தபட்சம்',
            aggregate_avg: 'மதிப்பீட்டு : சராசரி',
            aggregate_remove: 'மதிப்பீட்டு : நீக்கு'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('tr', {
          headerCell: {
            aria: {
              defaultFilterLabel: 'Sütun için filtre',
              removeFilter: 'Filtreyi Kaldır',
              columnMenuButtonLabel: 'Sütun Menüsü'
            },
            priority: 'Öncelik:',
            filterLabel: "Sütun için filtre: "
          },
          aggregate: {label: 'kayıtlar'},
          groupPanel: {description: 'Sütuna göre gruplamak için sütun başlığını buraya sürükleyin ve bırakın.'},
          search: {
            placeholder: 'Arama...',
            showingItems: 'Gösterilen Kayıt:',
            selectedItems: 'Seçili Kayıt:',
            totalItems: 'Toplam Kayıt:',
            size: 'Sayfa Boyutu:',
            first: 'İlk Sayfa',
            next: 'Sonraki Sayfa',
            previous: 'Önceki Sayfa',
            last: 'Son Sayfa'
          },
          menu: {text: 'Sütunları Seç:'},
          sort: {
            ascending: 'Artan Sırada Sırala',
            descending: 'Azalan Sırada Sırala',
            none: 'Sıralama Yapma',
            remove: 'Sıralamayı Kaldır'
          },
          column: {hide: 'Sütunu Gizle'},
          aggregation: {
            count: 'toplam satır: ',
            sum: 'toplam: ',
            avg: 'ort: ',
            min: 'min: ',
            max: 'maks: '
          },
          pinning: {
            pinLeft: 'Sola Sabitle',
            pinRight: 'Sağa Sabitle',
            unpin: 'Sabitlemeyi Kaldır'
          },
          columnMenu: {close: 'Kapat'},
          gridMenu: {
            aria: {buttonLabel: 'Tablo Menü'},
            columns: 'Sütunlar:',
            importerTitle: 'Dosya içeri aktar',
            exporterAllAsCsv: 'Bütün veriyi CSV olarak dışarı aktar',
            exporterVisibleAsCsv: 'Görünen veriyi CSV olarak dışarı aktar',
            exporterSelectedAsCsv: 'Seçili veriyi CSV olarak dışarı aktar',
            exporterAllAsPdf: 'Bütün veriyi PDF olarak dışarı aktar',
            exporterVisibleAsPdf: 'Görünen veriyi PDF olarak dışarı aktar',
            exporterSelectedAsPdf: 'Seçili veriyi PDF olarak dışarı aktar',
            clearAllFilters: 'Bütün filtreleri kaldır'
          },
          importer: {
            noHeaders: 'Sütun isimleri üretilemiyor, dosyanın bir başlığı var mı?',
            noObjects: 'Nesneler üretilemiyor, dosyada başlıktan başka bir veri var mı?',
            invalidCsv: 'Dosya işlenemedi, geçerli bir CSV dosyası mı?',
            invalidJson: 'Dosya işlenemedi, geçerli bir Json dosyası mı?',
            jsonNotArray: 'Alınan Json dosyasında bir dizi bulunmalıdır, işlem iptal ediliyor.'
          },
          pagination: {
            aria: {
              pageToFirst: 'İlk sayfaya',
              pageBack: 'Geri git',
              pageSelected: 'Seçili sayfa',
              pageForward: 'İleri git',
              pageToLast: 'Sona git'
            },
            sizes: 'Sayfadaki nesne sayısı',
            totalItems: 'kayıtlar',
            through: '',
            of: ''
          },
          grouping: {
            group: 'Grupla',
            ungroup: 'Gruplama',
            aggregate_count: 'Yekun: Sayı',
            aggregate_sum: 'Yekun: Toplam',
            aggregate_max: 'Yekun: Maks',
            aggregate_min: 'Yekun: Min',
            aggregate_avg: 'Yekun: Ort',
            aggregate_remove: 'Yekun: Sil'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    var DIRECTIVE_ALIASES = ['uiT', 'uiTranslate'];
    var FILTER_ALIASES = ['t', 'uiTranslate'];
    var module = angular.module('ui.grid.i18n');
    module.constant('i18nConstants', {
      MISSING: '[MISSING]',
      UPDATE_EVENT: '$uiI18n',
      LOCALE_DIRECTIVE_ALIAS: 'uiI18n',
      DEFAULT_LANG: 'en'
    });
    module.service('i18nService', ['$log', 'i18nConstants', '$rootScope', function($log, i18nConstants, $rootScope) {
      var langCache = {
        _langs: {},
        current: null,
        get: function(lang) {
          return this._langs[lang.toLowerCase()];
        },
        add: function(lang, strings) {
          var lower = lang.toLowerCase();
          if (!this._langs[lower]) {
            this._langs[lower] = {};
          }
          angular.extend(this._langs[lower], strings);
        },
        getAllLangs: function() {
          var langs = [];
          if (!this._langs) {
            return langs;
          }
          for (var key in this._langs) {
            langs.push(key);
          }
          return langs;
        },
        setCurrent: function(lang) {
          this.current = lang.toLowerCase();
        },
        getCurrentLang: function() {
          return this.current;
        }
      };
      var service = {
        add: function(langs, stringMaps) {
          if (typeof(langs) === 'object') {
            angular.forEach(langs, function(lang) {
              if (lang) {
                langCache.add(lang, stringMaps);
              }
            });
          } else {
            langCache.add(langs, stringMaps);
          }
        },
        getAllLangs: function() {
          return langCache.getAllLangs();
        },
        get: function(lang) {
          var language = lang ? lang : service.getCurrentLang();
          return langCache.get(language);
        },
        getSafeText: function(path, lang) {
          var language = lang ? lang : service.getCurrentLang();
          var trans = langCache.get(language);
          if (!trans) {
            return i18nConstants.MISSING;
          }
          var paths = path.split('.');
          var current = trans;
          for (var i = 0; i < paths.length; ++i) {
            if (current[paths[i]] === undefined || current[paths[i]] === null) {
              return i18nConstants.MISSING;
            } else {
              current = current[paths[i]];
            }
          }
          return current;
        },
        setCurrentLang: function(lang) {
          if (lang) {
            langCache.setCurrent(lang);
            $rootScope.$broadcast(i18nConstants.UPDATE_EVENT);
          }
        },
        getCurrentLang: function() {
          var lang = langCache.getCurrentLang();
          if (!lang) {
            lang = i18nConstants.DEFAULT_LANG;
            langCache.setCurrent(lang);
          }
          return lang;
        }
      };
      return service;
    }]);
    var localeDirective = function(i18nService, i18nConstants) {
      return {compile: function() {
          return {pre: function($scope, $elm, $attrs) {
              var alias = i18nConstants.LOCALE_DIRECTIVE_ALIAS;
              var lang = $scope.$eval($attrs[alias]);
              if (lang) {
                $scope.$watch($attrs[alias], function() {
                  i18nService.setCurrentLang(lang);
                });
              } else if ($attrs.$$observers) {
                $attrs.$observe(alias, function() {
                  i18nService.setCurrentLang($attrs[alias] || i18nConstants.DEFAULT_LANG);
                });
              }
            }};
        }};
    };
    module.directive('uiI18n', ['i18nService', 'i18nConstants', localeDirective]);
    var uitDirective = function($parse, i18nService, i18nConstants) {
      return {
        restrict: 'EA',
        compile: function() {
          return {pre: function($scope, $elm, $attrs) {
              var alias1 = DIRECTIVE_ALIASES[0],
                  alias2 = DIRECTIVE_ALIASES[1];
              var token = $attrs[alias1] || $attrs[alias2] || $elm.html();
              var missing = i18nConstants.MISSING + token;
              var observer;
              if ($attrs.$$observers) {
                var prop = $attrs[alias1] ? alias1 : alias2;
                observer = $attrs.$observe(prop, function(result) {
                  if (result) {
                    $elm.html($parse(result)(i18nService.getCurrentLang()) || missing);
                  }
                });
              }
              var getter = $parse(token);
              var listener = $scope.$on(i18nConstants.UPDATE_EVENT, function(evt) {
                if (observer) {
                  observer($attrs[alias1] || $attrs[alias2]);
                } else {
                  $elm.html(getter(i18nService.get()) || missing);
                }
              });
              $scope.$on('$destroy', listener);
              $elm.html(getter(i18nService.get()) || missing);
            }};
        }
      };
    };
    angular.forEach(DIRECTIVE_ALIASES, function(alias) {
      module.directive(alias, ['$parse', 'i18nService', 'i18nConstants', uitDirective]);
    });
    var uitFilter = function($parse, i18nService, i18nConstants) {
      return function(data) {
        var getter = $parse(data);
        return getter(i18nService.get()) || i18nConstants.MISSING + data;
      };
    };
    angular.forEach(FILTER_ALIASES, function(alias) {
      module.filter(alias, ['$parse', 'i18nService', 'i18nConstants', uitFilter]);
    });
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('zh-cn', {
          headerCell: {
            aria: {
              defaultFilterLabel: '列过滤器',
              removeFilter: '移除过滤器',
              columnMenuButtonLabel: '列菜单'
            },
            priority: '优先级:',
            filterLabel: "列过滤器: "
          },
          aggregate: {label: '行'},
          groupPanel: {description: '拖曳表头到此处进行分组'},
          search: {
            placeholder: '查找',
            showingItems: '已显示行数：',
            selectedItems: '已选择行数：',
            totalItems: '总行数：',
            size: '每页显示行数：',
            first: '首页',
            next: '下一页',
            previous: '上一页',
            last: '末页'
          },
          menu: {text: '选择列：'},
          sort: {
            ascending: '升序',
            descending: '降序',
            none: '无序',
            remove: '取消排序'
          },
          column: {hide: '隐藏列'},
          aggregation: {
            count: '计数：',
            sum: '求和：',
            avg: '均值：',
            min: '最小值：',
            max: '最大值：'
          },
          pinning: {
            pinLeft: '左侧固定',
            pinRight: '右侧固定',
            unpin: '取消固定'
          },
          columnMenu: {close: '关闭'},
          gridMenu: {
            aria: {buttonLabel: '表格菜单'},
            columns: '列：',
            importerTitle: '导入文件',
            exporterAllAsCsv: '导出全部数据到CSV',
            exporterVisibleAsCsv: '导出可见数据到CSV',
            exporterSelectedAsCsv: '导出已选数据到CSV',
            exporterAllAsPdf: '导出全部数据到PDF',
            exporterVisibleAsPdf: '导出可见数据到PDF',
            exporterSelectedAsPdf: '导出已选数据到PDF',
            clearAllFilters: '清除所有过滤器'
          },
          importer: {
            noHeaders: '无法获取列名，确定文件包含表头？',
            noObjects: '无法获取数据，确定文件包含数据？',
            invalidCsv: '无法处理文件，确定是合法的CSV文件？',
            invalidJson: '无法处理文件，确定是合法的JSON文件？',
            jsonNotArray: '导入的文件不是JSON数组！'
          },
          pagination: {
            aria: {
              pageToFirst: '第一页',
              pageBack: '上一页',
              pageSelected: '当前页',
              pageForward: '下一页',
              pageToLast: '最后一页'
            },
            sizes: '行每页',
            totalItems: '行',
            through: '至',
            of: '共'
          },
          grouping: {
            group: '分组',
            ungroup: '取消分组',
            aggregate_count: '合计: 计数',
            aggregate_sum: '合计: 求和',
            aggregate_max: '合计: 最大',
            aggregate_min: '合计: 最小',
            aggregate_avg: '合计: 平均',
            aggregate_remove: '合计: 移除'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('i18nService', ['$delegate', function($delegate) {
        $delegate.add('zh-tw', {
          aggregate: {label: '行'},
          groupPanel: {description: '拖曳表頭到此處進行分組'},
          search: {
            placeholder: '查找',
            showingItems: '已顯示行數：',
            selectedItems: '已選擇行數：',
            totalItems: '總行數：',
            size: '每頁顯示行數：',
            first: '首頁',
            next: '下壹頁',
            previous: '上壹頁',
            last: '末頁'
          },
          menu: {text: '選擇列：'},
          sort: {
            ascending: '升序',
            descending: '降序',
            remove: '取消排序'
          },
          column: {hide: '隱藏列'},
          aggregation: {
            count: '計數：',
            sum: '求和：',
            avg: '均值：',
            min: '最小值：',
            max: '最大值：'
          },
          pinning: {
            pinLeft: '左側固定',
            pinRight: '右側固定',
            unpin: '取消固定'
          },
          gridMenu: {
            columns: '列：',
            importerTitle: '導入文件',
            exporterAllAsCsv: '導出全部數據到CSV',
            exporterVisibleAsCsv: '導出可見數據到CSV',
            exporterSelectedAsCsv: '導出已選數據到CSV',
            exporterAllAsPdf: '導出全部數據到PDF',
            exporterVisibleAsPdf: '導出可見數據到PDF',
            exporterSelectedAsPdf: '導出已選數據到PDF',
            clearAllFilters: '清除所有过滤器'
          },
          importer: {
            noHeaders: '無法獲取列名，確定文件包含表頭？',
            noObjects: '無法獲取數據，確定文件包含數據？',
            invalidCsv: '無法處理文件，確定是合法的CSV文件？',
            invalidJson: '無法處理文件，確定是合法的JSON文件？',
            jsonNotArray: '導入的文件不是JSON數組！'
          },
          pagination: {
            sizes: '行每頁',
            totalItems: '行'
          }
        });
        return $delegate;
      }]);
    }]);
  })();
  (function() {
    'use strict';
    var module = angular.module('ui.grid.autoResize', ['ui.grid']);
    module.directive('uiGridAutoResize', ['$timeout', 'gridUtil', function($timeout, gridUtil) {
      return {
        require: 'uiGrid',
        scope: false,
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          var prevGridWidth,
              prevGridHeight;
          function getDimensions() {
            prevGridHeight = gridUtil.elementHeight($elm);
            prevGridWidth = gridUtil.elementWidth($elm);
          }
          getDimensions();
          var resizeTimeoutId;
          function startTimeout() {
            clearTimeout(resizeTimeoutId);
            resizeTimeoutId = setTimeout(function() {
              var newGridHeight = gridUtil.elementHeight($elm);
              var newGridWidth = gridUtil.elementWidth($elm);
              if (newGridHeight !== prevGridHeight || newGridWidth !== prevGridWidth) {
                uiGridCtrl.grid.gridHeight = newGridHeight;
                uiGridCtrl.grid.gridWidth = newGridWidth;
                $scope.$apply(function() {
                  uiGridCtrl.grid.refresh().then(function() {
                    getDimensions();
                    startTimeout();
                  });
                });
              } else {
                startTimeout();
              }
            }, 250);
          }
          startTimeout();
          $scope.$on('$destroy', function() {
            clearTimeout(resizeTimeoutId);
          });
        }
      };
    }]);
  })();
  (function() {
    'use strict';
    var module = angular.module('ui.grid.cellNav', ['ui.grid']);
    module.constant('uiGridCellNavConstants', {
      FEATURE_NAME: 'gridCellNav',
      CELL_NAV_EVENT: 'cellNav',
      direction: {
        LEFT: 0,
        RIGHT: 1,
        UP: 2,
        DOWN: 3,
        PG_UP: 4,
        PG_DOWN: 5
      },
      EVENT_TYPE: {
        KEYDOWN: 0,
        CLICK: 1,
        CLEAR: 2
      }
    });
    module.factory('uiGridCellNavFactory', ['gridUtil', 'uiGridConstants', 'uiGridCellNavConstants', 'GridRowColumn', '$q', function(gridUtil, uiGridConstants, uiGridCellNavConstants, GridRowColumn, $q) {
      var UiGridCellNav = function UiGridCellNav(rowContainer, colContainer, leftColContainer, rightColContainer) {
        this.rows = rowContainer.visibleRowCache;
        this.columns = colContainer.visibleColumnCache;
        this.leftColumns = leftColContainer ? leftColContainer.visibleColumnCache : [];
        this.rightColumns = rightColContainer ? rightColContainer.visibleColumnCache : [];
        this.bodyContainer = rowContainer;
      };
      UiGridCellNav.prototype.getFocusableCols = function() {
        var allColumns = this.leftColumns.concat(this.columns, this.rightColumns);
        return allColumns.filter(function(col) {
          return col.colDef.allowCellFocus;
        });
      };
      UiGridCellNav.prototype.getFocusableRows = function() {
        return this.rows.filter(function(row) {
          return row.allowCellFocus !== false;
        });
      };
      UiGridCellNav.prototype.getNextRowCol = function(direction, curRow, curCol) {
        switch (direction) {
          case uiGridCellNavConstants.direction.LEFT:
            return this.getRowColLeft(curRow, curCol);
          case uiGridCellNavConstants.direction.RIGHT:
            return this.getRowColRight(curRow, curCol);
          case uiGridCellNavConstants.direction.UP:
            return this.getRowColUp(curRow, curCol);
          case uiGridCellNavConstants.direction.DOWN:
            return this.getRowColDown(curRow, curCol);
          case uiGridCellNavConstants.direction.PG_UP:
            return this.getRowColPageUp(curRow, curCol);
          case uiGridCellNavConstants.direction.PG_DOWN:
            return this.getRowColPageDown(curRow, curCol);
        }
      };
      UiGridCellNav.prototype.initializeSelection = function() {
        var focusableCols = this.getFocusableCols();
        var focusableRows = this.getFocusableRows();
        if (focusableCols.length === 0 || focusableRows.length === 0) {
          return null;
        }
        var curRowIndex = 0;
        var curColIndex = 0;
        return new GridRowColumn(focusableRows[0], focusableCols[0]);
      };
      UiGridCellNav.prototype.getRowColLeft = function(curRow, curCol) {
        var focusableCols = this.getFocusableCols();
        var focusableRows = this.getFocusableRows();
        var curColIndex = focusableCols.indexOf(curCol);
        var curRowIndex = focusableRows.indexOf(curRow);
        if (curColIndex === -1) {
          curColIndex = 1;
        }
        var nextColIndex = curColIndex === 0 ? focusableCols.length - 1 : curColIndex - 1;
        if (nextColIndex > curColIndex) {
          if (curRowIndex === 0) {
            return new GridRowColumn(curRow, focusableCols[nextColIndex]);
          } else {
            return new GridRowColumn(focusableRows[curRowIndex - 1], focusableCols[nextColIndex]);
          }
        } else {
          return new GridRowColumn(curRow, focusableCols[nextColIndex]);
        }
      };
      UiGridCellNav.prototype.getRowColRight = function(curRow, curCol) {
        var focusableCols = this.getFocusableCols();
        var focusableRows = this.getFocusableRows();
        var curColIndex = focusableCols.indexOf(curCol);
        var curRowIndex = focusableRows.indexOf(curRow);
        if (curColIndex === -1) {
          curColIndex = 0;
        }
        var nextColIndex = curColIndex === focusableCols.length - 1 ? 0 : curColIndex + 1;
        if (nextColIndex < curColIndex) {
          if (curRowIndex === focusableRows.length - 1) {
            return new GridRowColumn(curRow, focusableCols[nextColIndex]);
          } else {
            return new GridRowColumn(focusableRows[curRowIndex + 1], focusableCols[nextColIndex]);
          }
        } else {
          return new GridRowColumn(curRow, focusableCols[nextColIndex]);
        }
      };
      UiGridCellNav.prototype.getRowColDown = function(curRow, curCol) {
        var focusableCols = this.getFocusableCols();
        var focusableRows = this.getFocusableRows();
        var curColIndex = focusableCols.indexOf(curCol);
        var curRowIndex = focusableRows.indexOf(curRow);
        if (curColIndex === -1) {
          curColIndex = 0;
        }
        if (curRowIndex === focusableRows.length - 1) {
          return new GridRowColumn(curRow, focusableCols[curColIndex]);
        } else {
          return new GridRowColumn(focusableRows[curRowIndex + 1], focusableCols[curColIndex]);
        }
      };
      UiGridCellNav.prototype.getRowColPageDown = function(curRow, curCol) {
        var focusableCols = this.getFocusableCols();
        var focusableRows = this.getFocusableRows();
        var curColIndex = focusableCols.indexOf(curCol);
        var curRowIndex = focusableRows.indexOf(curRow);
        if (curColIndex === -1) {
          curColIndex = 0;
        }
        var pageSize = this.bodyContainer.minRowsToRender();
        if (curRowIndex >= focusableRows.length - pageSize) {
          return new GridRowColumn(focusableRows[focusableRows.length - 1], focusableCols[curColIndex]);
        } else {
          return new GridRowColumn(focusableRows[curRowIndex + pageSize], focusableCols[curColIndex]);
        }
      };
      UiGridCellNav.prototype.getRowColUp = function(curRow, curCol) {
        var focusableCols = this.getFocusableCols();
        var focusableRows = this.getFocusableRows();
        var curColIndex = focusableCols.indexOf(curCol);
        var curRowIndex = focusableRows.indexOf(curRow);
        if (curColIndex === -1) {
          curColIndex = 0;
        }
        if (curRowIndex === 0) {
          return new GridRowColumn(curRow, focusableCols[curColIndex]);
        } else {
          return new GridRowColumn(focusableRows[curRowIndex - 1], focusableCols[curColIndex]);
        }
      };
      UiGridCellNav.prototype.getRowColPageUp = function(curRow, curCol) {
        var focusableCols = this.getFocusableCols();
        var focusableRows = this.getFocusableRows();
        var curColIndex = focusableCols.indexOf(curCol);
        var curRowIndex = focusableRows.indexOf(curRow);
        if (curColIndex === -1) {
          curColIndex = 0;
        }
        var pageSize = this.bodyContainer.minRowsToRender();
        if (curRowIndex - pageSize < 0) {
          return new GridRowColumn(focusableRows[0], focusableCols[curColIndex]);
        } else {
          return new GridRowColumn(focusableRows[curRowIndex - pageSize], focusableCols[curColIndex]);
        }
      };
      return UiGridCellNav;
    }]);
    module.service('uiGridCellNavService', ['gridUtil', 'uiGridConstants', 'uiGridCellNavConstants', '$q', 'uiGridCellNavFactory', 'GridRowColumn', 'ScrollEvent', function(gridUtil, uiGridConstants, uiGridCellNavConstants, $q, UiGridCellNav, GridRowColumn, ScrollEvent) {
      var service = {
        initializeGrid: function(grid) {
          grid.registerColumnBuilder(service.cellNavColumnBuilder);
          grid.cellNav = {};
          grid.cellNav.lastRowCol = null;
          grid.cellNav.focusedCells = [];
          service.defaultGridOptions(grid.options);
          var publicApi = {
            events: {cellNav: {
                navigate: function(newRowCol, oldRowCol) {},
                viewPortKeyDown: function(event, rowCol) {},
                viewPortKeyPress: function(event, rowCol) {}
              }},
            methods: {cellNav: {
                scrollToFocus: function(rowEntity, colDef) {
                  return service.scrollToFocus(grid, rowEntity, colDef);
                },
                getFocusedCell: function() {
                  return grid.cellNav.lastRowCol;
                },
                getCurrentSelection: function() {
                  return grid.cellNav.focusedCells;
                },
                rowColSelectIndex: function(rowCol) {
                  var index = -1;
                  for (var i = 0; i < grid.cellNav.focusedCells.length; i++) {
                    if (grid.cellNav.focusedCells[i].col.uid === rowCol.col.uid && grid.cellNav.focusedCells[i].row.uid === rowCol.row.uid) {
                      index = i;
                      break;
                    }
                  }
                  return index;
                }
              }}
          };
          grid.api.registerEventsFromObject(publicApi.events);
          grid.api.registerMethodsFromObject(publicApi.methods);
        },
        defaultGridOptions: function(gridOptions) {
          gridOptions.modifierKeysToMultiSelectCells = gridOptions.modifierKeysToMultiSelectCells === true;
        },
        decorateRenderContainers: function(grid) {
          var rightContainer = grid.hasRightContainer() ? grid.renderContainers.right : null;
          var leftContainer = grid.hasLeftContainer() ? grid.renderContainers.left : null;
          if (leftContainer !== null) {
            grid.renderContainers.left.cellNav = new UiGridCellNav(grid.renderContainers.body, leftContainer, rightContainer, grid.renderContainers.body);
          }
          if (rightContainer !== null) {
            grid.renderContainers.right.cellNav = new UiGridCellNav(grid.renderContainers.body, rightContainer, grid.renderContainers.body, leftContainer);
          }
          grid.renderContainers.body.cellNav = new UiGridCellNav(grid.renderContainers.body, grid.renderContainers.body, leftContainer, rightContainer);
        },
        getDirection: function(evt) {
          if (evt.keyCode === uiGridConstants.keymap.LEFT || (evt.keyCode === uiGridConstants.keymap.TAB && evt.shiftKey)) {
            return uiGridCellNavConstants.direction.LEFT;
          }
          if (evt.keyCode === uiGridConstants.keymap.RIGHT || evt.keyCode === uiGridConstants.keymap.TAB) {
            return uiGridCellNavConstants.direction.RIGHT;
          }
          if (evt.keyCode === uiGridConstants.keymap.UP || (evt.keyCode === uiGridConstants.keymap.ENTER && evt.shiftKey)) {
            return uiGridCellNavConstants.direction.UP;
          }
          if (evt.keyCode === uiGridConstants.keymap.PG_UP) {
            return uiGridCellNavConstants.direction.PG_UP;
          }
          if (evt.keyCode === uiGridConstants.keymap.DOWN || evt.keyCode === uiGridConstants.keymap.ENTER && !(evt.ctrlKey || evt.altKey)) {
            return uiGridCellNavConstants.direction.DOWN;
          }
          if (evt.keyCode === uiGridConstants.keymap.PG_DOWN) {
            return uiGridCellNavConstants.direction.PG_DOWN;
          }
          return null;
        },
        cellNavColumnBuilder: function(colDef, col, gridOptions) {
          var promises = [];
          colDef.allowCellFocus = colDef.allowCellFocus === undefined ? true : colDef.allowCellFocus;
          return $q.all(promises);
        },
        scrollToFocus: function(grid, rowEntity, colDef) {
          var gridRow = null,
              gridCol = null;
          if (typeof(rowEntity) !== 'undefined' && rowEntity !== null) {
            gridRow = grid.getRow(rowEntity);
          }
          if (typeof(colDef) !== 'undefined' && colDef !== null) {
            gridCol = grid.getColumn(colDef.name ? colDef.name : colDef.field);
          }
          return grid.api.core.scrollToIfNecessary(gridRow, gridCol).then(function() {
            var rowCol = {
              row: gridRow,
              col: gridCol
            };
            if (gridRow !== null && gridCol !== null) {
              grid.cellNav.broadcastCellNav(rowCol);
            }
          });
        },
        getLeftWidth: function(grid, upToCol) {
          var width = 0;
          if (!upToCol) {
            return width;
          }
          var lastIndex = grid.renderContainers.body.visibleColumnCache.indexOf(upToCol);
          grid.renderContainers.body.visibleColumnCache.forEach(function(col, index) {
            if (index < lastIndex) {
              width += col.drawnWidth;
            }
          });
          var percentage = lastIndex === 0 ? 0 : (lastIndex + 1) / grid.renderContainers.body.visibleColumnCache.length;
          width += upToCol.drawnWidth * percentage;
          return width;
        }
      };
      return service;
    }]);
    module.directive('uiGridCellnav', ['gridUtil', 'uiGridCellNavService', 'uiGridCellNavConstants', 'uiGridConstants', 'GridRowColumn', '$timeout', '$compile', function(gridUtil, uiGridCellNavService, uiGridCellNavConstants, uiGridConstants, GridRowColumn, $timeout, $compile) {
      return {
        replace: true,
        priority: -150,
        require: '^uiGrid',
        scope: false,
        controller: function() {},
        compile: function() {
          return {
            pre: function($scope, $elm, $attrs, uiGridCtrl) {
              var _scope = $scope;
              var grid = uiGridCtrl.grid;
              uiGridCellNavService.initializeGrid(grid);
              uiGridCtrl.cellNav = {};
              uiGridCtrl.cellNav.makeRowCol = function(obj) {
                if (!(obj instanceof GridRowColumn)) {
                  obj = new GridRowColumn(obj.row, obj.col);
                }
                return obj;
              };
              uiGridCtrl.cellNav.getActiveCell = function() {
                var elms = $elm[0].getElementsByClassName('ui-grid-cell-focus');
                if (elms.length > 0) {
                  return elms[0];
                }
                return undefined;
              };
              uiGridCtrl.cellNav.broadcastCellNav = grid.cellNav.broadcastCellNav = function(newRowCol, modifierDown, originEvt) {
                modifierDown = !(modifierDown === undefined || !modifierDown);
                newRowCol = uiGridCtrl.cellNav.makeRowCol(newRowCol);
                uiGridCtrl.cellNav.broadcastFocus(newRowCol, modifierDown, originEvt);
                _scope.$broadcast(uiGridCellNavConstants.CELL_NAV_EVENT, newRowCol, modifierDown, originEvt);
              };
              uiGridCtrl.cellNav.clearFocus = grid.cellNav.clearFocus = function() {
                grid.cellNav.focusedCells = [];
                _scope.$broadcast(uiGridCellNavConstants.CELL_NAV_EVENT);
              };
              uiGridCtrl.cellNav.broadcastFocus = function(rowCol, modifierDown, originEvt) {
                modifierDown = !(modifierDown === undefined || !modifierDown);
                rowCol = uiGridCtrl.cellNav.makeRowCol(rowCol);
                var row = rowCol.row,
                    col = rowCol.col;
                var rowColSelectIndex = uiGridCtrl.grid.api.cellNav.rowColSelectIndex(rowCol);
                if (grid.cellNav.lastRowCol === null || rowColSelectIndex === -1) {
                  var newRowCol = new GridRowColumn(row, col);
                  if (grid.cellNav.lastRowCol === null || grid.cellNav.lastRowCol.row !== newRowCol.row || grid.cellNav.lastRowCol.col !== newRowCol.col) {
                    grid.api.cellNav.raise.navigate(newRowCol, grid.cellNav.lastRowCol);
                    grid.cellNav.lastRowCol = newRowCol;
                  }
                  if (uiGridCtrl.grid.options.modifierKeysToMultiSelectCells && modifierDown) {
                    grid.cellNav.focusedCells.push(rowCol);
                  } else {
                    grid.cellNav.focusedCells = [rowCol];
                  }
                } else if (grid.options.modifierKeysToMultiSelectCells && modifierDown && rowColSelectIndex >= 0) {
                  grid.cellNav.focusedCells.splice(rowColSelectIndex, 1);
                }
              };
              uiGridCtrl.cellNav.handleKeyDown = function(evt) {
                var direction = uiGridCellNavService.getDirection(evt);
                if (direction === null) {
                  return null;
                }
                var containerId = 'body';
                if (evt.uiGridTargetRenderContainerId) {
                  containerId = evt.uiGridTargetRenderContainerId;
                }
                var lastRowCol = uiGridCtrl.grid.api.cellNav.getFocusedCell();
                if (lastRowCol) {
                  var rowCol = uiGridCtrl.grid.renderContainers[containerId].cellNav.getNextRowCol(direction, lastRowCol.row, lastRowCol.col);
                  var focusableCols = uiGridCtrl.grid.renderContainers[containerId].cellNav.getFocusableCols();
                  var rowColSelectIndex = uiGridCtrl.grid.api.cellNav.rowColSelectIndex(rowCol);
                  if (direction === uiGridCellNavConstants.direction.LEFT && rowCol.col === focusableCols[focusableCols.length - 1] && rowCol.row === lastRowCol.row && evt.keyCode === uiGridConstants.keymap.TAB && evt.shiftKey) {
                    grid.cellNav.focusedCells.splice(rowColSelectIndex, 1);
                    uiGridCtrl.cellNav.clearFocus();
                    return true;
                  } else if (direction === uiGridCellNavConstants.direction.RIGHT && rowCol.col === focusableCols[0] && rowCol.row === lastRowCol.row && evt.keyCode === uiGridConstants.keymap.TAB && !evt.shiftKey) {
                    grid.cellNav.focusedCells.splice(rowColSelectIndex, 1);
                    uiGridCtrl.cellNav.clearFocus();
                    return true;
                  }
                  grid.scrollToIfNecessary(rowCol.row, rowCol.col).then(function() {
                    uiGridCtrl.cellNav.broadcastCellNav(rowCol);
                  });
                  evt.stopPropagation();
                  evt.preventDefault();
                  return false;
                }
              };
            },
            post: function($scope, $elm, $attrs, uiGridCtrl) {
              var _scope = $scope;
              var grid = uiGridCtrl.grid;
              function addAriaLiveRegion() {
                var ariaNotifierDomElt = '<div ' + 'id="' + grid.id + '-aria-speakable" ' + 'class="ui-grid-a11y-ariascreenreader-speakable ui-grid-offscreen" ' + 'aria-live="assertive" ' + 'role="region" ' + 'aria-atomic="true" ' + 'aria-hidden="false" ' + 'aria-relevant="additions" ' + '>' + '&nbsp;' + '</div>';
                var ariaNotifier = $compile(ariaNotifierDomElt)($scope);
                $elm.prepend(ariaNotifier);
                $scope.$on(uiGridCellNavConstants.CELL_NAV_EVENT, function(evt, rowCol, modifierDown, originEvt) {
                  if (originEvt && originEvt.type === 'focus') {
                    return;
                  }
                  function setNotifyText(text) {
                    if (text === ariaNotifier.text()) {
                      return;
                    }
                    ariaNotifier[0].style.clip = 'rect(0px,0px,0px,0px)';
                    ariaNotifier[0].innerHTML = "";
                    ariaNotifier[0].style.visibility = 'hidden';
                    ariaNotifier[0].style.visibility = 'visible';
                    if (text !== '') {
                      ariaNotifier[0].style.clip = 'auto';
                      ariaNotifier[0].appendChild(document.createTextNode(text + " "));
                      ariaNotifier[0].style.visibility = 'hidden';
                      ariaNotifier[0].style.visibility = 'visible';
                    }
                  }
                  var values = [];
                  var currentSelection = grid.api.cellNav.getCurrentSelection();
                  for (var i = 0; i < currentSelection.length; i++) {
                    values.push(currentSelection[i].getIntersectionValueFiltered());
                  }
                  var cellText = values.toString();
                  setNotifyText(cellText);
                });
              }
              addAriaLiveRegion();
            }
          };
        }
      };
    }]);
    module.directive('uiGridRenderContainer', ['$timeout', '$document', 'gridUtil', 'uiGridConstants', 'uiGridCellNavService', '$compile', 'uiGridCellNavConstants', function($timeout, $document, gridUtil, uiGridConstants, uiGridCellNavService, $compile, uiGridCellNavConstants) {
      return {
        replace: true,
        priority: -99999,
        require: ['^uiGrid', 'uiGridRenderContainer', '?^uiGridCellnav'],
        scope: false,
        compile: function() {
          return {post: function($scope, $elm, $attrs, controllers) {
              var uiGridCtrl = controllers[0],
                  renderContainerCtrl = controllers[1],
                  uiGridCellnavCtrl = controllers[2];
              if (!uiGridCtrl.grid.api.cellNav) {
                return;
              }
              var containerId = renderContainerCtrl.containerId;
              var grid = uiGridCtrl.grid;
              uiGridCellNavService.decorateRenderContainers(grid);
              if (containerId !== 'body') {
                return;
              }
              if (uiGridCtrl.grid.options.modifierKeysToMultiSelectCells) {
                $elm.attr('aria-multiselectable', true);
              } else {
                $elm.attr('aria-multiselectable', false);
              }
              var focuser = $compile('<div class="ui-grid-focuser" role="region" aria-live="assertive" aria-atomic="false" tabindex="0" aria-controls="' + grid.id + '-aria-speakable ' + grid.id + '-grid-container' + '" aria-owns="' + grid.id + '-grid-container' + '"></div>')($scope);
              $elm.append(focuser);
              focuser.on('focus', function(evt) {
                evt.uiGridTargetRenderContainerId = containerId;
                var rowCol = uiGridCtrl.grid.api.cellNav.getFocusedCell();
                if (rowCol === null) {
                  rowCol = uiGridCtrl.grid.renderContainers[containerId].cellNav.getNextRowCol(uiGridCellNavConstants.direction.DOWN, null, null);
                  if (rowCol.row && rowCol.col) {
                    uiGridCtrl.cellNav.broadcastCellNav(rowCol);
                  }
                }
              });
              uiGridCellnavCtrl.setAriaActivedescendant = function(id) {
                $elm.attr('aria-activedescendant', id);
              };
              uiGridCellnavCtrl.removeAriaActivedescendant = function(id) {
                if ($elm.attr('aria-activedescendant') === id) {
                  $elm.attr('aria-activedescendant', '');
                }
              };
              uiGridCtrl.focus = function() {
                gridUtil.focus.byElement(focuser[0]);
              };
              var viewPortKeyDownWasRaisedForRowCol = null;
              focuser.on('keydown', function(evt) {
                evt.uiGridTargetRenderContainerId = containerId;
                var rowCol = uiGridCtrl.grid.api.cellNav.getFocusedCell();
                var result = uiGridCtrl.cellNav.handleKeyDown(evt);
                if (result === null) {
                  uiGridCtrl.grid.api.cellNav.raise.viewPortKeyDown(evt, rowCol);
                  viewPortKeyDownWasRaisedForRowCol = rowCol;
                }
              });
              focuser.on('keypress', function(evt) {
                if (viewPortKeyDownWasRaisedForRowCol) {
                  $timeout(function() {
                    uiGridCtrl.grid.api.cellNav.raise.viewPortKeyPress(evt, viewPortKeyDownWasRaisedForRowCol);
                  }, 4);
                  viewPortKeyDownWasRaisedForRowCol = null;
                }
              });
              $scope.$on('$destroy', function() {
                focuser.off();
              });
            }};
        }
      };
    }]);
    module.directive('uiGridViewport', ['$timeout', '$document', 'gridUtil', 'uiGridConstants', 'uiGridCellNavService', 'uiGridCellNavConstants', '$log', '$compile', function($timeout, $document, gridUtil, uiGridConstants, uiGridCellNavService, uiGridCellNavConstants, $log, $compile) {
      return {
        replace: true,
        priority: -99999,
        require: ['^uiGrid', '^uiGridRenderContainer', '?^uiGridCellnav'],
        scope: false,
        compile: function() {
          return {
            pre: function($scope, $elm, $attrs, uiGridCtrl) {},
            post: function($scope, $elm, $attrs, controllers) {
              var uiGridCtrl = controllers[0],
                  renderContainerCtrl = controllers[1];
              if (!uiGridCtrl.grid.api.cellNav) {
                return;
              }
              var containerId = renderContainerCtrl.containerId;
              if (containerId !== 'body') {
                return;
              }
              var grid = uiGridCtrl.grid;
              grid.api.core.on.scrollBegin($scope, function(args) {
                var lastRowCol = uiGridCtrl.grid.api.cellNav.getFocusedCell();
                if (lastRowCol === null) {
                  return;
                }
                if (!renderContainerCtrl.colContainer.containsColumn(lastRowCol.col)) {
                  return;
                }
                uiGridCtrl.cellNav.clearFocus();
              });
              grid.api.core.on.scrollEnd($scope, function(args) {
                var lastRowCol = uiGridCtrl.grid.api.cellNav.getFocusedCell();
                if (lastRowCol === null) {
                  return;
                }
                if (!renderContainerCtrl.colContainer.containsColumn(lastRowCol.col)) {
                  return;
                }
                uiGridCtrl.cellNav.broadcastCellNav(lastRowCol);
              });
              grid.api.cellNav.on.navigate($scope, function() {
                uiGridCtrl.focus();
              });
            }
          };
        }
      };
    }]);
    module.directive('uiGridCell', ['$timeout', '$document', 'uiGridCellNavService', 'gridUtil', 'uiGridCellNavConstants', 'uiGridConstants', 'GridRowColumn', function($timeout, $document, uiGridCellNavService, gridUtil, uiGridCellNavConstants, uiGridConstants, GridRowColumn) {
      return {
        priority: -150,
        restrict: 'A',
        require: ['^uiGrid', '?^uiGridCellnav'],
        scope: false,
        link: function($scope, $elm, $attrs, controllers) {
          var uiGridCtrl = controllers[0],
              uiGridCellnavCtrl = controllers[1];
          if (!uiGridCtrl.grid.api.cellNav) {
            return;
          }
          if (!$scope.col.colDef.allowCellFocus) {
            return;
          }
          var grid = uiGridCtrl.grid;
          $scope.focused = false;
          $elm.attr('tabindex', -1);
          $elm.find('div').on('click', function(evt) {
            uiGridCtrl.cellNav.broadcastCellNav(new GridRowColumn($scope.row, $scope.col), evt.ctrlKey || evt.metaKey, evt);
            evt.stopPropagation();
            $scope.$apply();
          });
          $elm.on('mousedown', preventMouseDown);
          if (uiGridCtrl.grid.api.edit) {
            uiGridCtrl.grid.api.edit.on.beginCellEdit($scope, function() {
              $elm.off('mousedown', preventMouseDown);
            });
            uiGridCtrl.grid.api.edit.on.afterCellEdit($scope, function() {
              $elm.on('mousedown', preventMouseDown);
            });
            uiGridCtrl.grid.api.edit.on.cancelCellEdit($scope, function() {
              $elm.on('mousedown', preventMouseDown);
            });
          }
          function preventMouseDown(evt) {
            evt.preventDefault();
          }
          $elm.on('focus', function(evt) {
            uiGridCtrl.cellNav.broadcastCellNav(new GridRowColumn($scope.row, $scope.col), false, evt);
            evt.stopPropagation();
            $scope.$apply();
          });
          $scope.$on(uiGridCellNavConstants.CELL_NAV_EVENT, function(evt, rowCol, modifierDown) {
            var isFocused = grid.cellNav.focusedCells.some(function(focusedRowCol, index) {
              return (focusedRowCol.row === $scope.row && focusedRowCol.col === $scope.col);
            });
            if (isFocused) {
              setFocused();
            } else {
              clearFocus();
            }
          });
          function setFocused() {
            if (!$scope.focused) {
              var div = $elm.find('div');
              div.addClass('ui-grid-cell-focus');
              $elm.attr('aria-selected', true);
              uiGridCellnavCtrl.setAriaActivedescendant($elm.attr('id'));
              $scope.focused = true;
            }
          }
          function clearFocus() {
            if ($scope.focused) {
              var div = $elm.find('div');
              div.removeClass('ui-grid-cell-focus');
              $elm.attr('aria-selected', false);
              uiGridCellnavCtrl.removeAriaActivedescendant($elm.attr('id'));
              $scope.focused = false;
            }
          }
          $scope.$on('$destroy', function() {
            $elm.find('div').off();
            $elm.off();
          });
        }
      };
    }]);
  })();
  (function() {
    'use strict';
    var module = angular.module('ui.grid.edit', ['ui.grid']);
    module.constant('uiGridEditConstants', {
      EDITABLE_CELL_TEMPLATE: /EDITABLE_CELL_TEMPLATE/g,
      EDITABLE_CELL_DIRECTIVE: /editable_cell_directive/g,
      events: {
        BEGIN_CELL_EDIT: 'uiGridEventBeginCellEdit',
        END_CELL_EDIT: 'uiGridEventEndCellEdit',
        CANCEL_CELL_EDIT: 'uiGridEventCancelCellEdit'
      }
    });
    module.service('uiGridEditService', ['$q', 'uiGridConstants', 'gridUtil', function($q, uiGridConstants, gridUtil) {
      var service = {
        initializeGrid: function(grid) {
          service.defaultGridOptions(grid.options);
          grid.registerColumnBuilder(service.editColumnBuilder);
          grid.edit = {};
          var publicApi = {
            events: {edit: {
                afterCellEdit: function(rowEntity, colDef, newValue, oldValue) {},
                beginCellEdit: function(rowEntity, colDef, triggerEvent) {},
                cancelCellEdit: function(rowEntity, colDef) {}
              }},
            methods: {edit: {}}
          };
          grid.api.registerEventsFromObject(publicApi.events);
        },
        defaultGridOptions: function(gridOptions) {
          gridOptions.cellEditableCondition = gridOptions.cellEditableCondition === undefined ? true : gridOptions.cellEditableCondition;
          gridOptions.enableCellEditOnFocus = gridOptions.enableCellEditOnFocus === undefined ? false : gridOptions.enableCellEditOnFocus;
        },
        editColumnBuilder: function(colDef, col, gridOptions) {
          var promises = [];
          colDef.enableCellEdit = colDef.enableCellEdit === undefined ? (gridOptions.enableCellEdit === undefined ? (colDef.type !== 'object') : gridOptions.enableCellEdit) : colDef.enableCellEdit;
          colDef.cellEditableCondition = colDef.cellEditableCondition === undefined ? gridOptions.cellEditableCondition : colDef.cellEditableCondition;
          if (colDef.enableCellEdit) {
            colDef.editableCellTemplate = colDef.editableCellTemplate || gridOptions.editableCellTemplate || 'ui-grid/cellEditor';
            promises.push(gridUtil.getTemplate(colDef.editableCellTemplate).then(function(template) {
              col.editableCellTemplate = template;
            }, function(res) {
              throw new Error("Couldn't fetch/use colDef.editableCellTemplate '" + colDef.editableCellTemplate + "'");
            }));
          }
          colDef.enableCellEditOnFocus = colDef.enableCellEditOnFocus === undefined ? gridOptions.enableCellEditOnFocus : colDef.enableCellEditOnFocus;
          return $q.all(promises);
        },
        isStartEditKey: function(evt) {
          if (evt.metaKey || evt.keyCode === uiGridConstants.keymap.ESC || evt.keyCode === uiGridConstants.keymap.SHIFT || evt.keyCode === uiGridConstants.keymap.CTRL || evt.keyCode === uiGridConstants.keymap.ALT || evt.keyCode === uiGridConstants.keymap.WIN || evt.keyCode === uiGridConstants.keymap.CAPSLOCK || evt.keyCode === uiGridConstants.keymap.LEFT || (evt.keyCode === uiGridConstants.keymap.TAB && evt.shiftKey) || evt.keyCode === uiGridConstants.keymap.RIGHT || evt.keyCode === uiGridConstants.keymap.TAB || evt.keyCode === uiGridConstants.keymap.UP || (evt.keyCode === uiGridConstants.keymap.ENTER && evt.shiftKey) || evt.keyCode === uiGridConstants.keymap.DOWN || evt.keyCode === uiGridConstants.keymap.ENTER) {
            return false;
          }
          return true;
        }
      };
      return service;
    }]);
    module.directive('uiGridEdit', ['gridUtil', 'uiGridEditService', function(gridUtil, uiGridEditService) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        compile: function() {
          return {
            pre: function($scope, $elm, $attrs, uiGridCtrl) {
              uiGridEditService.initializeGrid(uiGridCtrl.grid);
            },
            post: function($scope, $elm, $attrs, uiGridCtrl) {}
          };
        }
      };
    }]);
    module.directive('uiGridViewport', ['uiGridEditConstants', function(uiGridEditConstants) {
      return {
        replace: true,
        priority: -99998,
        require: ['^uiGrid', '^uiGridRenderContainer'],
        scope: false,
        compile: function() {
          return {post: function($scope, $elm, $attrs, controllers) {
              var uiGridCtrl = controllers[0];
              if (!uiGridCtrl.grid.api.edit || !uiGridCtrl.grid.api.cellNav) {
                return;
              }
              var containerId = controllers[1].containerId;
              if (containerId !== 'body') {
                return;
              }
              $scope.$on(uiGridEditConstants.events.CANCEL_CELL_EDIT, function() {
                uiGridCtrl.focus();
              });
              $scope.$on(uiGridEditConstants.events.END_CELL_EDIT, function() {
                uiGridCtrl.focus();
              });
            }};
        }
      };
    }]);
    module.directive('uiGridCell', ['$compile', '$injector', '$timeout', 'uiGridConstants', 'uiGridEditConstants', 'gridUtil', '$parse', 'uiGridEditService', '$rootScope', '$q', function($compile, $injector, $timeout, uiGridConstants, uiGridEditConstants, gridUtil, $parse, uiGridEditService, $rootScope, $q) {
      var touchstartTimeout = 500;
      if ($injector.has('uiGridCellNavService')) {
        var uiGridCellNavService = $injector.get('uiGridCellNavService');
      }
      return {
        priority: -100,
        restrict: 'A',
        scope: false,
        require: '?^uiGrid',
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          var html;
          var origCellValue;
          var inEdit = false;
          var cellModel;
          var cancelTouchstartTimeout;
          var editCellScope;
          if (!$scope.col.colDef.enableCellEdit) {
            return;
          }
          var cellNavNavigateDereg = function() {};
          var viewPortKeyDownDereg = function() {};
          var setEditable = function() {
            if ($scope.col.colDef.enableCellEdit && $scope.row.enableCellEdit !== false) {
              if (!$scope.beginEditEventsWired) {
                registerBeginEditEvents();
              }
            } else {
              if ($scope.beginEditEventsWired) {
                cancelBeginEditEvents();
              }
            }
          };
          setEditable();
          var rowWatchDereg = $scope.$watch('row', function(n, o) {
            if (n !== o) {
              setEditable();
            }
          });
          $scope.$on('$destroy', rowWatchDereg);
          function registerBeginEditEvents() {
            $elm.on('dblclick', beginEdit);
            $elm.on('touchstart', touchStart);
            if (uiGridCtrl && uiGridCtrl.grid.api.cellNav) {
              viewPortKeyDownDereg = uiGridCtrl.grid.api.cellNav.on.viewPortKeyDown($scope, function(evt, rowCol) {
                if (rowCol === null) {
                  return;
                }
                if (rowCol.row === $scope.row && rowCol.col === $scope.col && !$scope.col.colDef.enableCellEditOnFocus) {
                  beginEditKeyDown(evt);
                }
              });
              cellNavNavigateDereg = uiGridCtrl.grid.api.cellNav.on.navigate($scope, function(newRowCol, oldRowCol) {
                if ($scope.col.colDef.enableCellEditOnFocus) {
                  if ((!oldRowCol || newRowCol.row !== oldRowCol.row || newRowCol.col !== oldRowCol.col) && newRowCol.row === $scope.row && newRowCol.col === $scope.col) {
                    $timeout(function() {
                      beginEdit();
                    });
                  }
                }
              });
            }
            $scope.beginEditEventsWired = true;
          }
          function touchStart(event) {
            if (typeof(event.originalEvent) !== 'undefined' && event.originalEvent !== undefined) {
              event = event.originalEvent;
            }
            $elm.on('touchend', touchEnd);
            cancelTouchstartTimeout = $timeout(function() {}, touchstartTimeout);
            cancelTouchstartTimeout.then(function() {
              setTimeout(beginEdit, 0);
              $elm.off('touchend', touchEnd);
            });
          }
          function touchEnd(event) {
            $timeout.cancel(cancelTouchstartTimeout);
            $elm.off('touchend', touchEnd);
          }
          function cancelBeginEditEvents() {
            $elm.off('dblclick', beginEdit);
            $elm.off('keydown', beginEditKeyDown);
            $elm.off('touchstart', touchStart);
            cellNavNavigateDereg();
            viewPortKeyDownDereg();
            $scope.beginEditEventsWired = false;
          }
          function beginEditKeyDown(evt) {
            if (uiGridEditService.isStartEditKey(evt)) {
              beginEdit(evt);
            }
          }
          function shouldEdit(col, row) {
            return !row.isSaving && (angular.isFunction(col.colDef.cellEditableCondition) ? col.colDef.cellEditableCondition($scope) : col.colDef.cellEditableCondition);
          }
          function beginEdit(triggerEvent) {
            $scope.grid.api.core.scrollToIfNecessary($scope.row, $scope.col).then(function() {
              beginEditAfterScroll(triggerEvent);
            });
          }
          function beginEditAfterScroll(triggerEvent) {
            if (inEdit) {
              return;
            }
            if (!shouldEdit($scope.col, $scope.row)) {
              return;
            }
            cellModel = $parse($scope.row.getQualifiedColField($scope.col));
            origCellValue = cellModel($scope);
            html = $scope.col.editableCellTemplate;
            if ($scope.col.colDef.editModelField) {
              html = html.replace(uiGridConstants.MODEL_COL_FIELD, gridUtil.preEval('row.entity.' + $scope.col.colDef.editModelField));
            } else {
              html = html.replace(uiGridConstants.MODEL_COL_FIELD, $scope.row.getQualifiedColField($scope.col));
            }
            html = html.replace(uiGridConstants.COL_FIELD, 'grid.getCellValue(row, col)');
            var optionFilter = $scope.col.colDef.editDropdownFilter ? '|' + $scope.col.colDef.editDropdownFilter : '';
            html = html.replace(uiGridConstants.CUSTOM_FILTERS, optionFilter);
            var inputType = 'text';
            switch ($scope.col.colDef.type) {
              case 'boolean':
                inputType = 'checkbox';
                break;
              case 'number':
                inputType = 'number';
                break;
              case 'date':
                inputType = 'date';
                break;
            }
            html = html.replace('INPUT_TYPE', inputType);
            var editDropdownOptionsFunction = $scope.col.colDef.editDropdownOptionsFunction;
            if (editDropdownOptionsFunction) {
              $q.when(editDropdownOptionsFunction($scope.row.entity, $scope.col.colDef)).then(function(result) {
                $scope.editDropdownOptionsArray = result;
              });
            } else {
              var editDropdownRowEntityOptionsArrayPath = $scope.col.colDef.editDropdownRowEntityOptionsArrayPath;
              if (editDropdownRowEntityOptionsArrayPath) {
                $scope.editDropdownOptionsArray = resolveObjectFromPath($scope.row.entity, editDropdownRowEntityOptionsArrayPath);
              } else {
                $scope.editDropdownOptionsArray = $scope.col.colDef.editDropdownOptionsArray;
              }
            }
            $scope.editDropdownIdLabel = $scope.col.colDef.editDropdownIdLabel ? $scope.col.colDef.editDropdownIdLabel : 'id';
            $scope.editDropdownValueLabel = $scope.col.colDef.editDropdownValueLabel ? $scope.col.colDef.editDropdownValueLabel : 'value';
            var cellElement;
            var createEditor = function() {
              inEdit = true;
              cancelBeginEditEvents();
              var cellElement = angular.element(html);
              $elm.append(cellElement);
              editCellScope = $scope.$new();
              $compile(cellElement)(editCellScope);
              var gridCellContentsEl = angular.element($elm.children()[0]);
              gridCellContentsEl.addClass('ui-grid-cell-contents-hidden');
            };
            if (!$rootScope.$$phase) {
              $scope.$apply(createEditor);
            } else {
              createEditor();
            }
            var deregOnGridScroll = $scope.col.grid.api.core.on.scrollBegin($scope, function() {
              if ($scope.grid.disableScrolling) {
                return;
              }
              endEdit();
              $scope.grid.api.edit.raise.afterCellEdit($scope.row.entity, $scope.col.colDef, cellModel($scope), origCellValue);
              deregOnGridScroll();
              deregOnEndCellEdit();
              deregOnCancelCellEdit();
            });
            var deregOnEndCellEdit = $scope.$on(uiGridEditConstants.events.END_CELL_EDIT, function() {
              endEdit();
              $scope.grid.api.edit.raise.afterCellEdit($scope.row.entity, $scope.col.colDef, cellModel($scope), origCellValue);
              deregOnEndCellEdit();
              deregOnGridScroll();
              deregOnCancelCellEdit();
            });
            var deregOnCancelCellEdit = $scope.$on(uiGridEditConstants.events.CANCEL_CELL_EDIT, function() {
              cancelEdit();
              deregOnCancelCellEdit();
              deregOnGridScroll();
              deregOnEndCellEdit();
            });
            $scope.$broadcast(uiGridEditConstants.events.BEGIN_CELL_EDIT, triggerEvent);
            $timeout(function() {
              $scope.grid.api.edit.raise.beginCellEdit($scope.row.entity, $scope.col.colDef, triggerEvent);
            });
          }
          function endEdit() {
            $scope.grid.disableScrolling = false;
            if (!inEdit) {
              return;
            }
            if (uiGridCtrl && uiGridCtrl.grid.api.cellNav) {
              uiGridCtrl.focus();
            }
            var gridCellContentsEl = angular.element($elm.children()[0]);
            editCellScope.$destroy();
            angular.element($elm.children()[1]).remove();
            gridCellContentsEl.removeClass('ui-grid-cell-contents-hidden');
            inEdit = false;
            registerBeginEditEvents();
            $scope.grid.api.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
          }
          function cancelEdit() {
            $scope.grid.disableScrolling = false;
            if (!inEdit) {
              return;
            }
            cellModel.assign($scope, origCellValue);
            $scope.$apply();
            $scope.grid.api.edit.raise.cancelCellEdit($scope.row.entity, $scope.col.colDef);
            endEdit();
          }
          function resolveObjectFromPath(object, path) {
            path = path.replace(/\[(\w+)\]/g, '.$1');
            path = path.replace(/^\./, '');
            var a = path.split('.');
            while (a.length) {
              var n = a.shift();
              if (n in object) {
                object = object[n];
              } else {
                return;
              }
            }
            return object;
          }
        }
      };
    }]);
    module.directive('uiGridEditor', ['gridUtil', 'uiGridConstants', 'uiGridEditConstants', '$timeout', 'uiGridEditService', function(gridUtil, uiGridConstants, uiGridEditConstants, $timeout, uiGridEditService) {
      return {
        scope: true,
        require: ['?^uiGrid', '?^uiGridRenderContainer', 'ngModel'],
        compile: function() {
          return {
            pre: function($scope, $elm, $attrs) {},
            post: function($scope, $elm, $attrs, controllers) {
              var uiGridCtrl,
                  renderContainerCtrl,
                  ngModel;
              if (controllers[0]) {
                uiGridCtrl = controllers[0];
              }
              if (controllers[1]) {
                renderContainerCtrl = controllers[1];
              }
              if (controllers[2]) {
                ngModel = controllers[2];
              }
              $scope.$on(uiGridEditConstants.events.BEGIN_CELL_EDIT, function(evt, triggerEvent) {
                $timeout(function() {
                  $elm[0].focus();
                  if ($elm[0].select && $scope.col.colDef.enableCellEditOnFocus || !(uiGridCtrl && uiGridCtrl.grid.api.cellNav)) {
                    $elm[0].select();
                  } else {
                    try {
                      $elm[0].setSelectionRange($elm[0].value.length, $elm[0].value.length);
                    } catch (ex) {}
                  }
                });
                if (uiGridCtrl && uiGridCtrl.grid.api.cellNav) {
                  var viewPortKeyDownUnregister = uiGridCtrl.grid.api.cellNav.on.viewPortKeyPress($scope, function(evt, rowCol) {
                    if (uiGridEditService.isStartEditKey(evt)) {
                      ngModel.$setViewValue(String.fromCharCode(typeof evt.which === 'number' ? evt.which : evt.keyCode), evt);
                      ngModel.$render();
                    }
                    viewPortKeyDownUnregister();
                  });
                }
                $elm.on('blur', function(evt) {
                  $scope.stopEdit(evt);
                });
              });
              $scope.deepEdit = false;
              $scope.stopEdit = function(evt) {
                if ($scope.inputForm && !$scope.inputForm.$valid) {
                  evt.stopPropagation();
                  $scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                } else {
                  $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                }
                $scope.deepEdit = false;
              };
              $elm.on('click', function(evt) {
                if ($elm[0].type !== 'checkbox') {
                  $scope.deepEdit = true;
                  $timeout(function() {
                    $scope.grid.disableScrolling = true;
                  });
                }
              });
              $elm.on('keydown', function(evt) {
                switch (evt.keyCode) {
                  case uiGridConstants.keymap.ESC:
                    evt.stopPropagation();
                    $scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                    break;
                }
                if ($scope.deepEdit && (evt.keyCode === uiGridConstants.keymap.LEFT || evt.keyCode === uiGridConstants.keymap.RIGHT || evt.keyCode === uiGridConstants.keymap.UP || evt.keyCode === uiGridConstants.keymap.DOWN)) {
                  evt.stopPropagation();
                } else if (uiGridCtrl && uiGridCtrl.grid.api.cellNav) {
                  evt.uiGridTargetRenderContainerId = renderContainerCtrl.containerId;
                  if (uiGridCtrl.cellNav.handleKeyDown(evt) !== null) {
                    $scope.stopEdit(evt);
                  }
                } else {
                  switch (evt.keyCode) {
                    case uiGridConstants.keymap.ENTER:
                    case uiGridConstants.keymap.TAB:
                      evt.stopPropagation();
                      evt.preventDefault();
                      $scope.stopEdit(evt);
                      break;
                  }
                }
                return true;
              });
            }
          };
        }
      };
    }]);
    module.directive('uiGridEditor', ['$filter', function($filter) {
      function parseDateString(dateString) {
        if (typeof(dateString) === 'undefined' || dateString === '') {
          return null;
        }
        var parts = dateString.split('-');
        if (parts.length !== 3) {
          return null;
        }
        var year = parseInt(parts[0], 10);
        var month = parseInt(parts[1], 10);
        var day = parseInt(parts[2], 10);
        if (month < 1 || year < 1 || day < 1) {
          return null;
        }
        return new Date(year, (month - 1), day);
      }
      return {
        priority: -100,
        require: '?ngModel',
        link: function(scope, element, attrs, ngModel) {
          if (angular.version.minor === 2 && attrs.type && attrs.type === 'date' && ngModel) {
            ngModel.$formatters.push(function(modelValue) {
              ngModel.$setValidity(null, (!modelValue || !isNaN(modelValue.getTime())));
              return $filter('date')(modelValue, 'yyyy-MM-dd');
            });
            ngModel.$parsers.push(function(viewValue) {
              if (viewValue && viewValue.length > 0) {
                var dateValue = parseDateString(viewValue);
                ngModel.$setValidity(null, (dateValue && !isNaN(dateValue.getTime())));
                return dateValue;
              } else {
                ngModel.$setValidity(null, true);
                return null;
              }
            });
          }
        }
      };
    }]);
    module.directive('uiGridEditDropdown', ['uiGridConstants', 'uiGridEditConstants', function(uiGridConstants, uiGridEditConstants) {
      return {
        require: ['?^uiGrid', '?^uiGridRenderContainer'],
        scope: true,
        compile: function() {
          return {
            pre: function($scope, $elm, $attrs) {},
            post: function($scope, $elm, $attrs, controllers) {
              var uiGridCtrl = controllers[0];
              var renderContainerCtrl = controllers[1];
              $scope.$on(uiGridEditConstants.events.BEGIN_CELL_EDIT, function() {
                $elm[0].focus();
                $elm[0].style.width = ($elm[0].parentElement.offsetWidth - 1) + 'px';
                $elm.on('blur', function(evt) {
                  $scope.stopEdit(evt);
                });
              });
              $scope.stopEdit = function(evt) {
                $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
              };
              $elm.on('keydown', function(evt) {
                switch (evt.keyCode) {
                  case uiGridConstants.keymap.ESC:
                    evt.stopPropagation();
                    $scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                    break;
                }
                if (uiGridCtrl && uiGridCtrl.grid.api.cellNav) {
                  evt.uiGridTargetRenderContainerId = renderContainerCtrl.containerId;
                  if (uiGridCtrl.cellNav.handleKeyDown(evt) !== null) {
                    $scope.stopEdit(evt);
                  }
                } else {
                  switch (evt.keyCode) {
                    case uiGridConstants.keymap.ENTER:
                    case uiGridConstants.keymap.TAB:
                      evt.stopPropagation();
                      evt.preventDefault();
                      $scope.stopEdit(evt);
                      break;
                  }
                }
                return true;
              });
            }
          };
        }
      };
    }]);
    module.directive('uiGridEditFileChooser', ['gridUtil', 'uiGridConstants', 'uiGridEditConstants', '$timeout', function(gridUtil, uiGridConstants, uiGridEditConstants, $timeout) {
      return {
        scope: true,
        require: ['?^uiGrid', '?^uiGridRenderContainer'],
        compile: function() {
          return {
            pre: function($scope, $elm, $attrs) {},
            post: function($scope, $elm, $attrs, controllers) {
              var uiGridCtrl,
                  renderContainerCtrl;
              if (controllers[0]) {
                uiGridCtrl = controllers[0];
              }
              if (controllers[1]) {
                renderContainerCtrl = controllers[1];
              }
              var grid = uiGridCtrl.grid;
              var handleFileSelect = function(event) {
                var target = event.srcElement || event.target;
                if (target && target.files && target.files.length > 0) {
                  if (typeof($scope.col.colDef.editFileChooserCallback) === 'function') {
                    $scope.col.colDef.editFileChooserCallback($scope.row, $scope.col, target.files);
                  } else {
                    gridUtil.logError('You need to set colDef.editFileChooserCallback to use the file chooser');
                  }
                  target.form.reset();
                  $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                } else {
                  $scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                }
              };
              $elm[0].addEventListener('change', handleFileSelect, false);
              $scope.$on(uiGridEditConstants.events.BEGIN_CELL_EDIT, function() {
                $elm[0].focus();
                $elm[0].select();
                $elm.on('blur', function(evt) {
                  $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                });
              });
            }
          };
        }
      };
    }]);
  })();
  (function() {
    'use strict';
    var module = angular.module('ui.grid.expandable', ['ui.grid']);
    module.service('uiGridExpandableService', ['gridUtil', '$compile', function(gridUtil, $compile) {
      var service = {
        initializeGrid: function(grid) {
          grid.expandable = {};
          grid.expandable.expandedAll = false;
          grid.options.enableExpandable = grid.options.enableExpandable !== false;
          grid.options.expandableRowHeight = grid.options.expandableRowHeight || 150;
          grid.options.expandableRowHeaderWidth = grid.options.expandableRowHeaderWidth || 40;
          if (grid.options.enableExpandable && !grid.options.expandableRowTemplate) {
            gridUtil.logError('You have not set the expandableRowTemplate, disabling expandable module');
            grid.options.enableExpandable = false;
          }
          var publicApi = {
            events: {expandable: {
                rowExpandedBeforeStateChanged: function(scope, row) {},
                rowExpandedStateChanged: function(scope, row) {}
              }},
            methods: {expandable: {
                toggleRowExpansion: function(rowEntity) {
                  var row = grid.getRow(rowEntity);
                  if (row !== null) {
                    service.toggleRowExpansion(grid, row);
                  }
                },
                expandAllRows: function() {
                  service.expandAllRows(grid);
                },
                collapseAllRows: function() {
                  service.collapseAllRows(grid);
                },
                toggleAllRows: function() {
                  service.toggleAllRows(grid);
                },
                expandRow: function(rowEntity) {
                  var row = grid.getRow(rowEntity);
                  if (row !== null && !row.isExpanded) {
                    service.toggleRowExpansion(grid, row);
                  }
                },
                collapseRow: function(rowEntity) {
                  var row = grid.getRow(rowEntity);
                  if (row !== null && row.isExpanded) {
                    service.toggleRowExpansion(grid, row);
                  }
                },
                getExpandedRows: function() {
                  return service.getExpandedRows(grid).map(function(gridRow) {
                    return gridRow.entity;
                  });
                }
              }}
          };
          grid.api.registerEventsFromObject(publicApi.events);
          grid.api.registerMethodsFromObject(publicApi.methods);
        },
        toggleRowExpansion: function(grid, row) {
          grid.api.expandable.raise.rowExpandedBeforeStateChanged(row);
          row.isExpanded = !row.isExpanded;
          if (angular.isUndefined(row.expandedRowHeight)) {
            row.expandedRowHeight = grid.options.expandableRowHeight;
          }
          if (row.isExpanded) {
            row.height = row.grid.options.rowHeight + row.expandedRowHeight;
          } else {
            row.height = row.grid.options.rowHeight;
            grid.expandable.expandedAll = false;
          }
          grid.api.expandable.raise.rowExpandedStateChanged(row);
        },
        expandAllRows: function(grid, $scope) {
          grid.renderContainers.body.visibleRowCache.forEach(function(row) {
            if (!row.isExpanded) {
              service.toggleRowExpansion(grid, row);
            }
          });
          grid.expandable.expandedAll = true;
          grid.queueGridRefresh();
        },
        collapseAllRows: function(grid) {
          grid.renderContainers.body.visibleRowCache.forEach(function(row) {
            if (row.isExpanded) {
              service.toggleRowExpansion(grid, row);
            }
          });
          grid.expandable.expandedAll = false;
          grid.queueGridRefresh();
        },
        toggleAllRows: function(grid) {
          if (grid.expandable.expandedAll) {
            service.collapseAllRows(grid);
          } else {
            service.expandAllRows(grid);
          }
        },
        getExpandedRows: function(grid) {
          return grid.rows.filter(function(row) {
            return row.isExpanded;
          });
        }
      };
      return service;
    }]);
    module.directive('uiGridExpandable', ['uiGridExpandableService', '$templateCache', function(uiGridExpandableService, $templateCache) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        compile: function() {
          return {
            pre: function($scope, $elm, $attrs, uiGridCtrl) {
              if (uiGridCtrl.grid.options.enableExpandableRowHeader !== false) {
                var expandableRowHeaderColDef = {
                  name: 'expandableButtons',
                  displayName: '',
                  exporterSuppressExport: true,
                  enableColumnResizing: false,
                  enableColumnMenu: false,
                  width: uiGridCtrl.grid.options.expandableRowHeaderWidth || 40
                };
                expandableRowHeaderColDef.cellTemplate = $templateCache.get('ui-grid/expandableRowHeader');
                expandableRowHeaderColDef.headerCellTemplate = $templateCache.get('ui-grid/expandableTopRowHeader');
                uiGridCtrl.grid.addRowHeaderColumn(expandableRowHeaderColDef);
              }
              uiGridExpandableService.initializeGrid(uiGridCtrl.grid);
            },
            post: function($scope, $elm, $attrs, uiGridCtrl) {}
          };
        }
      };
    }]);
    module.directive('uiGrid', ['uiGridExpandableService', '$templateCache', function(uiGridExpandableService, $templateCache) {
      return {
        replace: true,
        priority: 599,
        require: '^uiGrid',
        scope: false,
        compile: function() {
          return {
            pre: function($scope, $elm, $attrs, uiGridCtrl) {
              uiGridCtrl.grid.api.core.on.renderingComplete($scope, function() {
                if ($scope.row && $scope.row.grid && $scope.row.grid.options && $scope.row.grid.options.enableExpandable) {
                  uiGridCtrl.grid.parentRow = $scope.row;
                }
              });
            },
            post: function($scope, $elm, $attrs, uiGridCtrl) {}
          };
        }
      };
    }]);
    module.directive('uiGridExpandableRow', ['uiGridExpandableService', '$timeout', '$compile', 'uiGridConstants', 'gridUtil', '$interval', '$log', function(uiGridExpandableService, $timeout, $compile, uiGridConstants, gridUtil, $interval, $log) {
      return {
        replace: false,
        priority: 0,
        scope: false,
        compile: function() {
          return {
            pre: function($scope, $elm, $attrs, uiGridCtrl) {
              gridUtil.getTemplate($scope.grid.options.expandableRowTemplate).then(function(template) {
                if ($scope.grid.options.expandableRowScope) {
                  var expandableRowScope = $scope.grid.options.expandableRowScope;
                  for (var property in expandableRowScope) {
                    if (expandableRowScope.hasOwnProperty(property)) {
                      $scope[property] = expandableRowScope[property];
                    }
                  }
                }
                var expandedRowElement = $compile(template)($scope);
                $elm.append(expandedRowElement);
                $scope.row.expandedRendered = true;
              });
            },
            post: function($scope, $elm, $attrs, uiGridCtrl) {
              $scope.$on('$destroy', function() {
                $scope.row.expandedRendered = false;
              });
            }
          };
        }
      };
    }]);
    module.directive('uiGridRow', ['$compile', 'gridUtil', '$templateCache', function($compile, gridUtil, $templateCache) {
      return {
        priority: -200,
        scope: false,
        compile: function($elm, $attrs) {
          return {
            pre: function($scope, $elm, $attrs, controllers) {
              $scope.expandableRow = {};
              $scope.expandableRow.shouldRenderExpand = function() {
                var ret = $scope.colContainer.name === 'body' && $scope.grid.options.enableExpandable !== false && $scope.row.isExpanded && (!$scope.grid.isScrollingVertically || $scope.row.expandedRendered);
                return ret;
              };
              $scope.expandableRow.shouldRenderFiller = function() {
                var ret = $scope.row.isExpanded && ($scope.colContainer.name !== 'body' || ($scope.grid.isScrollingVertically && !$scope.row.expandedRendered));
                return ret;
              };
            },
            post: function($scope, $elm, $attrs, controllers) {}
          };
        }
      };
    }]);
    module.directive('uiGridViewport', ['$compile', 'gridUtil', '$templateCache', function($compile, gridUtil, $templateCache) {
      return {
        priority: -200,
        scope: false,
        compile: function($elm, $attrs) {
          var rowRepeatDiv = angular.element($elm.children().children()[0]);
          var expandedRowFillerElement = $templateCache.get('ui-grid/expandableScrollFiller');
          var expandedRowElement = $templateCache.get('ui-grid/expandableRow');
          rowRepeatDiv.append(expandedRowElement);
          rowRepeatDiv.append(expandedRowFillerElement);
          return {
            pre: function($scope, $elm, $attrs, controllers) {},
            post: function($scope, $elm, $attrs, controllers) {}
          };
        }
      };
    }]);
  })();
  (function() {
    'use strict';
    var module = angular.module('ui.grid.exporter', ['ui.grid']);
    module.constant('uiGridExporterConstants', {
      featureName: 'exporter',
      ALL: 'all',
      VISIBLE: 'visible',
      SELECTED: 'selected',
      CSV_CONTENT: 'CSV_CONTENT',
      BUTTON_LABEL: 'BUTTON_LABEL',
      FILE_NAME: 'FILE_NAME'
    });
    module.service('uiGridExporterService', ['$q', 'uiGridExporterConstants', 'gridUtil', '$compile', '$interval', 'i18nService', function($q, uiGridExporterConstants, gridUtil, $compile, $interval, i18nService) {
      var service = {
        delay: 100,
        initializeGrid: function(grid) {
          grid.exporter = {};
          this.defaultGridOptions(grid.options);
          var publicApi = {
            events: {exporter: {}},
            methods: {exporter: {
                csvExport: function(rowTypes, colTypes) {
                  service.csvExport(grid, rowTypes, colTypes);
                },
                pdfExport: function(rowTypes, colTypes) {
                  service.pdfExport(grid, rowTypes, colTypes);
                }
              }}
          };
          grid.api.registerEventsFromObject(publicApi.events);
          grid.api.registerMethodsFromObject(publicApi.methods);
          if (grid.api.core.addToGridMenu) {
            service.addToMenu(grid);
          } else {
            $interval(function() {
              if (grid.api.core.addToGridMenu) {
                service.addToMenu(grid);
              }
            }, this.delay, 1);
          }
        },
        defaultGridOptions: function(gridOptions) {
          gridOptions.exporterSuppressMenu = gridOptions.exporterSuppressMenu === true;
          gridOptions.exporterMenuLabel = gridOptions.exporterMenuLabel ? gridOptions.exporterMenuLabel : 'Export';
          gridOptions.exporterSuppressColumns = gridOptions.exporterSuppressColumns ? gridOptions.exporterSuppressColumns : [];
          gridOptions.exporterCsvColumnSeparator = gridOptions.exporterCsvColumnSeparator ? gridOptions.exporterCsvColumnSeparator : ',';
          gridOptions.exporterCsvFilename = gridOptions.exporterCsvFilename ? gridOptions.exporterCsvFilename : 'download.csv';
          gridOptions.exporterPdfFilename = gridOptions.exporterPdfFilename ? gridOptions.exporterPdfFilename : 'download.pdf';
          gridOptions.exporterOlderExcelCompatibility = gridOptions.exporterOlderExcelCompatibility === true;
          gridOptions.exporterPdfDefaultStyle = gridOptions.exporterPdfDefaultStyle ? gridOptions.exporterPdfDefaultStyle : {fontSize: 11};
          gridOptions.exporterPdfTableStyle = gridOptions.exporterPdfTableStyle ? gridOptions.exporterPdfTableStyle : {margin: [0, 5, 0, 15]};
          gridOptions.exporterPdfTableHeaderStyle = gridOptions.exporterPdfTableHeaderStyle ? gridOptions.exporterPdfTableHeaderStyle : {
            bold: true,
            fontSize: 12,
            color: 'black'
          };
          gridOptions.exporterPdfHeader = gridOptions.exporterPdfHeader ? gridOptions.exporterPdfHeader : null;
          gridOptions.exporterPdfFooter = gridOptions.exporterPdfFooter ? gridOptions.exporterPdfFooter : null;
          gridOptions.exporterPdfOrientation = gridOptions.exporterPdfOrientation ? gridOptions.exporterPdfOrientation : 'landscape';
          gridOptions.exporterPdfPageSize = gridOptions.exporterPdfPageSize ? gridOptions.exporterPdfPageSize : 'A4';
          gridOptions.exporterPdfMaxGridWidth = gridOptions.exporterPdfMaxGridWidth ? gridOptions.exporterPdfMaxGridWidth : 720;
          gridOptions.exporterMenuAllData = gridOptions.exporterMenuAllData !== undefined ? gridOptions.exporterMenuAllData : true;
          gridOptions.exporterMenuVisibleData = gridOptions.exporterMenuVisibleData !== undefined ? gridOptions.exporterMenuVisibleData : true;
          gridOptions.exporterMenuSelectedData = gridOptions.exporterMenuSelectedData !== undefined ? gridOptions.exporterMenuSelectedData : true;
          gridOptions.exporterMenuCsv = gridOptions.exporterMenuCsv !== undefined ? gridOptions.exporterMenuCsv : true;
          gridOptions.exporterMenuPdf = gridOptions.exporterMenuPdf !== undefined ? gridOptions.exporterMenuPdf : true;
          gridOptions.exporterPdfCustomFormatter = (gridOptions.exporterPdfCustomFormatter && typeof(gridOptions.exporterPdfCustomFormatter) === 'function') ? gridOptions.exporterPdfCustomFormatter : function(docDef) {
            return docDef;
          };
          gridOptions.exporterHeaderFilterUseName = gridOptions.exporterHeaderFilterUseName === true;
          gridOptions.exporterFieldCallback = gridOptions.exporterFieldCallback ? gridOptions.exporterFieldCallback : function(grid, row, col, value) {
            return value;
          };
          gridOptions.exporterAllDataFn = gridOptions.exporterAllDataFn ? gridOptions.exporterAllDataFn : null;
          if (gridOptions.exporterAllDataFn == null && gridOptions.exporterAllDataPromise) {
            gridOptions.exporterAllDataFn = gridOptions.exporterAllDataPromise;
          }
        },
        addToMenu: function(grid) {
          grid.api.core.addToGridMenu(grid, [{
            title: i18nService.getSafeText('gridMenu.exporterAllAsCsv'),
            action: function($event) {
              this.grid.api.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            },
            shown: function() {
              return this.grid.options.exporterMenuCsv && this.grid.options.exporterMenuAllData;
            },
            order: 200
          }, {
            title: i18nService.getSafeText('gridMenu.exporterVisibleAsCsv'),
            action: function($event) {
              this.grid.api.exporter.csvExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.VISIBLE);
            },
            shown: function() {
              return this.grid.options.exporterMenuCsv && this.grid.options.exporterMenuVisibleData;
            },
            order: 201
          }, {
            title: i18nService.getSafeText('gridMenu.exporterSelectedAsCsv'),
            action: function($event) {
              this.grid.api.exporter.csvExport(uiGridExporterConstants.SELECTED, uiGridExporterConstants.VISIBLE);
            },
            shown: function() {
              return this.grid.options.exporterMenuCsv && this.grid.options.exporterMenuSelectedData && (this.grid.api.selection && this.grid.api.selection.getSelectedRows().length > 0);
            },
            order: 202
          }, {
            title: i18nService.getSafeText('gridMenu.exporterAllAsPdf'),
            action: function($event) {
              this.grid.api.exporter.pdfExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            },
            shown: function() {
              return this.grid.options.exporterMenuPdf && this.grid.options.exporterMenuAllData;
            },
            order: 203
          }, {
            title: i18nService.getSafeText('gridMenu.exporterVisibleAsPdf'),
            action: function($event) {
              this.grid.api.exporter.pdfExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.VISIBLE);
            },
            shown: function() {
              return this.grid.options.exporterMenuPdf && this.grid.options.exporterMenuVisibleData;
            },
            order: 204
          }, {
            title: i18nService.getSafeText('gridMenu.exporterSelectedAsPdf'),
            action: function($event) {
              this.grid.api.exporter.pdfExport(uiGridExporterConstants.SELECTED, uiGridExporterConstants.VISIBLE);
            },
            shown: function() {
              return this.grid.options.exporterMenuPdf && this.grid.options.exporterMenuSelectedData && (this.grid.api.selection && this.grid.api.selection.getSelectedRows().length > 0);
            },
            order: 205
          }]);
        },
        csvExport: function(grid, rowTypes, colTypes) {
          var self = this;
          this.loadAllDataIfNeeded(grid, rowTypes, colTypes).then(function() {
            var exportColumnHeaders = grid.options.showHeader ? self.getColumnHeaders(grid, colTypes) : [];
            var exportData = self.getData(grid, rowTypes, colTypes);
            var csvContent = self.formatAsCsv(exportColumnHeaders, exportData, grid.options.exporterCsvColumnSeparator);
            self.downloadFile(grid.options.exporterCsvFilename, csvContent, grid.options.exporterOlderExcelCompatibility);
          });
        },
        loadAllDataIfNeeded: function(grid, rowTypes, colTypes) {
          if (rowTypes === uiGridExporterConstants.ALL && grid.rows.length !== grid.options.totalItems && grid.options.exporterAllDataFn) {
            return grid.options.exporterAllDataFn().then(function() {
              grid.modifyRows(grid.options.data);
            });
          } else {
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
          }
        },
        getColumnHeaders: function(grid, colTypes) {
          var headers = [];
          var columns;
          if (colTypes === uiGridExporterConstants.ALL) {
            columns = grid.columns;
          } else {
            var leftColumns = grid.renderContainers.left ? grid.renderContainers.left.visibleColumnCache.filter(function(column) {
              return column.visible;
            }) : [];
            var bodyColumns = grid.renderContainers.body ? grid.renderContainers.body.visibleColumnCache.filter(function(column) {
              return column.visible;
            }) : [];
            var rightColumns = grid.renderContainers.right ? grid.renderContainers.right.visibleColumnCache.filter(function(column) {
              return column.visible;
            }) : [];
            columns = leftColumns.concat(bodyColumns, rightColumns);
          }
          columns.forEach(function(gridCol, index) {
            if (gridCol.colDef.exporterSuppressExport !== true && grid.options.exporterSuppressColumns.indexOf(gridCol.name) === -1) {
              headers.push({
                name: gridCol.field,
                displayName: grid.options.exporterHeaderFilter ? (grid.options.exporterHeaderFilterUseName ? grid.options.exporterHeaderFilter(gridCol.name) : grid.options.exporterHeaderFilter(gridCol.displayName)) : gridCol.displayName,
                width: gridCol.drawnWidth ? gridCol.drawnWidth : gridCol.width,
                align: gridCol.colDef.type === 'number' ? 'right' : 'left'
              });
            }
          });
          return headers;
        },
        getData: function(grid, rowTypes, colTypes, applyCellFilters) {
          var data = [];
          var rows;
          var columns;
          switch (rowTypes) {
            case uiGridExporterConstants.ALL:
              rows = grid.rows;
              break;
            case uiGridExporterConstants.VISIBLE:
              rows = grid.getVisibleRows();
              break;
            case uiGridExporterConstants.SELECTED:
              if (grid.api.selection) {
                rows = grid.api.selection.getSelectedGridRows();
              } else {
                gridUtil.logError('selection feature must be enabled to allow selected rows to be exported');
              }
              break;
          }
          if (colTypes === uiGridExporterConstants.ALL) {
            columns = grid.columns;
          } else {
            var leftColumns = grid.renderContainers.left ? grid.renderContainers.left.visibleColumnCache.filter(function(column) {
              return column.visible;
            }) : [];
            var bodyColumns = grid.renderContainers.body ? grid.renderContainers.body.visibleColumnCache.filter(function(column) {
              return column.visible;
            }) : [];
            var rightColumns = grid.renderContainers.right ? grid.renderContainers.right.visibleColumnCache.filter(function(column) {
              return column.visible;
            }) : [];
            columns = leftColumns.concat(bodyColumns, rightColumns);
          }
          rows.forEach(function(row, index) {
            if (row.exporterEnableExporting !== false) {
              var extractedRow = [];
              columns.forEach(function(gridCol, index) {
                if ((gridCol.visible || colTypes === uiGridExporterConstants.ALL) && gridCol.colDef.exporterSuppressExport !== true && grid.options.exporterSuppressColumns.indexOf(gridCol.name) === -1) {
                  var cellValue = applyCellFilters ? grid.getCellDisplayValue(row, gridCol) : grid.getCellValue(row, gridCol);
                  var extractedField = {value: grid.options.exporterFieldCallback(grid, row, gridCol, cellValue)};
                  if (gridCol.colDef.exporterPdfAlign) {
                    extractedField.alignment = gridCol.colDef.exporterPdfAlign;
                  }
                  extractedRow.push(extractedField);
                }
              });
              data.push(extractedRow);
            }
          });
          return data;
        },
        formatAsCsv: function(exportColumnHeaders, exportData, separator) {
          var self = this;
          var bareHeaders = exportColumnHeaders.map(function(header) {
            return {value: header.displayName};
          });
          var csv = bareHeaders.length > 0 ? (self.formatRowAsCsv(this, separator)(bareHeaders) + '\n') : '';
          csv += exportData.map(this.formatRowAsCsv(this, separator)).join('\n');
          return csv;
        },
        formatRowAsCsv: function(exporter, separator) {
          return function(row) {
            return row.map(exporter.formatFieldAsCsv).join(separator);
          };
        },
        formatFieldAsCsv: function(field) {
          if (field.value == null) {
            return '';
          }
          if (typeof(field.value) === 'number') {
            return field.value;
          }
          if (typeof(field.value) === 'boolean') {
            return (field.value ? 'TRUE' : 'FALSE');
          }
          if (typeof(field.value) === 'string') {
            return '"' + field.value.replace(/"/g, '""') + '"';
          }
          return JSON.stringify(field.value);
        },
        isIE: function() {
          var match = navigator.userAgent.search(/(?:Edge|MSIE|Trident\/.*; rv:)/);
          var isIE = false;
          if (match !== -1) {
            isIE = true;
          }
          return isIE;
        },
        downloadFile: function(fileName, csvContent, exporterOlderExcelCompatibility) {
          var D = document;
          var a = D.createElement('a');
          var strMimeType = 'application/octet-stream;charset=utf-8';
          var rawFile;
          var ieVersion;
          ieVersion = this.isIE();
          if (ieVersion && ieVersion < 10) {
            var frame = D.createElement('iframe');
            document.body.appendChild(frame);
            frame.contentWindow.document.open("text/html", "replace");
            frame.contentWindow.document.write('sep=,\r\n' + csvContent);
            frame.contentWindow.document.close();
            frame.contentWindow.focus();
            frame.contentWindow.document.execCommand('SaveAs', true, fileName);
            document.body.removeChild(frame);
            return true;
          }
          if (navigator.msSaveBlob) {
            return navigator.msSaveOrOpenBlob(new Blob([exporterOlderExcelCompatibility ? "\uFEFF" : '', csvContent], {type: strMimeType}), fileName);
          }
          if ('download' in a) {
            var blob = new Blob([exporterOlderExcelCompatibility ? "\uFEFF" : '', csvContent], {type: strMimeType});
            rawFile = URL.createObjectURL(blob);
            a.setAttribute('download', fileName);
          } else {
            rawFile = 'data:' + strMimeType + ',' + encodeURIComponent(csvContent);
            a.setAttribute('target', '_blank');
          }
          a.href = rawFile;
          a.setAttribute('style', 'display:none;');
          D.body.appendChild(a);
          setTimeout(function() {
            if (a.click) {
              a.click();
            } else if (document.createEvent) {
              var eventObj = document.createEvent('MouseEvents');
              eventObj.initEvent('click', true, true);
              a.dispatchEvent(eventObj);
            }
            D.body.removeChild(a);
          }, this.delay);
        },
        pdfExport: function(grid, rowTypes, colTypes) {
          var self = this;
          this.loadAllDataIfNeeded(grid, rowTypes, colTypes).then(function() {
            var exportColumnHeaders = self.getColumnHeaders(grid, colTypes);
            var exportData = self.getData(grid, rowTypes, colTypes);
            var docDefinition = self.prepareAsPdf(grid, exportColumnHeaders, exportData);
            if (self.isIE() || navigator.appVersion.indexOf("Edge") !== -1) {
              self.downloadPDF(grid.options.exporterPdfFilename, docDefinition);
            } else {
              pdfMake.createPdf(docDefinition).open();
            }
          });
        },
        downloadPDF: function(fileName, docDefinition) {
          var D = document;
          var a = D.createElement('a');
          var strMimeType = 'application/octet-stream;charset=utf-8';
          var rawFile;
          var ieVersion;
          ieVersion = this.isIE();
          var doc = pdfMake.createPdf(docDefinition);
          var blob;
          doc.getBuffer(function(buffer) {
            blob = new Blob([buffer]);
            if (navigator.msSaveBlob) {
              return navigator.msSaveBlob(blob, fileName);
            }
            if (ieVersion) {
              var frame = D.createElement('iframe');
              document.body.appendChild(frame);
              frame.contentWindow.document.open("text/html", "replace");
              frame.contentWindow.document.write(blob);
              frame.contentWindow.document.close();
              frame.contentWindow.focus();
              frame.contentWindow.document.execCommand('SaveAs', true, fileName);
              document.body.removeChild(frame);
              return true;
            }
          });
        },
        prepareAsPdf: function(grid, exportColumnHeaders, exportData) {
          var headerWidths = this.calculatePdfHeaderWidths(grid, exportColumnHeaders);
          var headerColumns = exportColumnHeaders.map(function(header) {
            return {
              text: header.displayName,
              style: 'tableHeader'
            };
          });
          var stringData = exportData.map(this.formatRowAsPdf(this));
          var allData = [headerColumns].concat(stringData);
          var docDefinition = {
            pageOrientation: grid.options.exporterPdfOrientation,
            pageSize: grid.options.exporterPdfPageSize,
            content: [{
              style: 'tableStyle',
              table: {
                headerRows: 1,
                widths: headerWidths,
                body: allData
              }
            }],
            styles: {
              tableStyle: grid.options.exporterPdfTableStyle,
              tableHeader: grid.options.exporterPdfTableHeaderStyle
            },
            defaultStyle: grid.options.exporterPdfDefaultStyle
          };
          if (grid.options.exporterPdfLayout) {
            docDefinition.layout = grid.options.exporterPdfLayout;
          }
          if (grid.options.exporterPdfHeader) {
            docDefinition.header = grid.options.exporterPdfHeader;
          }
          if (grid.options.exporterPdfFooter) {
            docDefinition.footer = grid.options.exporterPdfFooter;
          }
          if (grid.options.exporterPdfCustomFormatter) {
            docDefinition = grid.options.exporterPdfCustomFormatter(docDefinition);
          }
          return docDefinition;
        },
        calculatePdfHeaderWidths: function(grid, exportHeaders) {
          var baseGridWidth = 0;
          exportHeaders.forEach(function(value) {
            if (typeof(value.width) === 'number') {
              baseGridWidth += value.width;
            }
          });
          var extraColumns = 0;
          exportHeaders.forEach(function(value) {
            if (value.width === '*') {
              extraColumns += 100;
            }
            if (typeof(value.width) === 'string' && value.width.match(/(\d)*%/)) {
              var percent = parseInt(value.width.match(/(\d)*%/)[0]);
              value.width = baseGridWidth * percent / 100;
              extraColumns += value.width;
            }
          });
          var gridWidth = baseGridWidth + extraColumns;
          return exportHeaders.map(function(header) {
            return header.width === '*' ? header.width : header.width * grid.options.exporterPdfMaxGridWidth / gridWidth;
          });
        },
        formatRowAsPdf: function(exporter) {
          return function(row) {
            return row.map(exporter.formatFieldAsPdfString);
          };
        },
        formatFieldAsPdfString: function(field) {
          var returnVal;
          if (field.value == null) {
            returnVal = '';
          } else if (typeof(field.value) === 'number') {
            returnVal = field.value.toString();
          } else if (typeof(field.value) === 'boolean') {
            returnVal = (field.value ? 'TRUE' : 'FALSE');
          } else if (typeof(field.value) === 'string') {
            returnVal = field.value.replace(/"/g, '""');
          } else {
            returnVal = JSON.stringify(field.value).replace(/^"/, '').replace(/"$/, '');
          }
          if (field.alignment && typeof(field.alignment) === 'string') {
            returnVal = {
              text: returnVal,
              alignment: field.alignment
            };
          }
          return returnVal;
        }
      };
      return service;
    }]);
    module.directive('uiGridExporter', ['uiGridExporterConstants', 'uiGridExporterService', 'gridUtil', '$compile', function(uiGridExporterConstants, uiGridExporterService, gridUtil, $compile) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          uiGridExporterService.initializeGrid(uiGridCtrl.grid);
          uiGridCtrl.grid.exporter.$scope = $scope;
        }
      };
    }]);
  })();
  (function() {
    'use strict';
    var module = angular.module('ui.grid.grouping', ['ui.grid', 'ui.grid.treeBase']);
    module.constant('uiGridGroupingConstants', {
      featureName: "grouping",
      rowHeaderColName: 'treeBaseRowHeaderCol',
      EXPANDED: 'expanded',
      COLLAPSED: 'collapsed',
      aggregation: {
        COUNT: 'count',
        SUM: 'sum',
        MAX: 'max',
        MIN: 'min',
        AVG: 'avg'
      }
    });
    module.service('uiGridGroupingService', ['$q', 'uiGridGroupingConstants', 'gridUtil', 'rowSorter', 'GridRow', 'gridClassFactory', 'i18nService', 'uiGridConstants', 'uiGridTreeBaseService', function($q, uiGridGroupingConstants, gridUtil, rowSorter, GridRow, gridClassFactory, i18nService, uiGridConstants, uiGridTreeBaseService) {
      var service = {
        initializeGrid: function(grid, $scope) {
          uiGridTreeBaseService.initializeGrid(grid, $scope);
          grid.grouping = {};
          grid.grouping.groupHeaderCache = {};
          service.defaultGridOptions(grid.options);
          grid.registerRowsProcessor(service.groupRows, 400);
          grid.registerColumnBuilder(service.groupingColumnBuilder);
          grid.registerColumnsProcessor(service.groupingColumnProcessor, 400);
          var publicApi = {
            events: {grouping: {
                aggregationChanged: {},
                groupingChanged: {}
              }},
            methods: {grouping: {
                getGrouping: function(getExpanded) {
                  var grouping = service.getGrouping(grid);
                  grouping.grouping.forEach(function(group) {
                    group.colName = group.col.name;
                    delete group.col;
                  });
                  grouping.aggregations.forEach(function(aggregation) {
                    aggregation.colName = aggregation.col.name;
                    delete aggregation.col;
                  });
                  grouping.aggregations = grouping.aggregations.filter(function(aggregation) {
                    return !aggregation.aggregation.source || aggregation.aggregation.source !== 'grouping';
                  });
                  if (getExpanded) {
                    grouping.rowExpandedStates = service.getRowExpandedStates(grid.grouping.groupingHeaderCache);
                  }
                  return grouping;
                },
                setGrouping: function(config) {
                  service.setGrouping(grid, config);
                },
                groupColumn: function(columnName) {
                  var column = grid.getColumn(columnName);
                  service.groupColumn(grid, column);
                },
                ungroupColumn: function(columnName) {
                  var column = grid.getColumn(columnName);
                  service.ungroupColumn(grid, column);
                },
                clearGrouping: function() {
                  service.clearGrouping(grid);
                },
                aggregateColumn: function(columnName, aggregationDef, aggregationLabel) {
                  var column = grid.getColumn(columnName);
                  service.aggregateColumn(grid, column, aggregationDef, aggregationLabel);
                }
              }}
          };
          grid.api.registerEventsFromObject(publicApi.events);
          grid.api.registerMethodsFromObject(publicApi.methods);
          grid.api.core.on.sortChanged($scope, service.tidyPriorities);
        },
        defaultGridOptions: function(gridOptions) {
          gridOptions.enableGrouping = gridOptions.enableGrouping !== false;
          gridOptions.groupingShowCounts = gridOptions.groupingShowCounts !== false;
          gridOptions.groupingNullLabel = typeof(gridOptions.groupingNullLabel) === 'undefined' ? 'Null' : gridOptions.groupingNullLabel;
          gridOptions.enableGroupHeaderSelection = gridOptions.enableGroupHeaderSelection === true;
        },
        groupingColumnBuilder: function(colDef, col, gridOptions) {
          if (colDef.enableGrouping === false) {
            return;
          }
          if (typeof(col.grouping) === 'undefined' && typeof(colDef.grouping) !== 'undefined') {
            col.grouping = angular.copy(colDef.grouping);
            if (typeof(col.grouping.groupPriority) !== 'undefined' && col.grouping.groupPriority > -1) {
              col.treeAggregationFn = uiGridTreeBaseService.nativeAggregations()[uiGridGroupingConstants.aggregation.COUNT].aggregationFn;
              col.treeAggregationFinalizerFn = service.groupedFinalizerFn;
            }
          } else if (typeof(col.grouping) === 'undefined') {
            col.grouping = {};
          }
          if (typeof(col.grouping) !== 'undefined' && typeof(col.grouping.groupPriority) !== 'undefined' && col.grouping.groupPriority >= 0) {
            col.suppressRemoveSort = true;
          }
          var groupColumn = {
            name: 'ui.grid.grouping.group',
            title: i18nService.get().grouping.group,
            icon: 'ui-grid-icon-indent-right',
            shown: function() {
              return typeof(this.context.col.grouping) === 'undefined' || typeof(this.context.col.grouping.groupPriority) === 'undefined' || this.context.col.grouping.groupPriority < 0;
            },
            action: function() {
              service.groupColumn(this.context.col.grid, this.context.col);
            }
          };
          var ungroupColumn = {
            name: 'ui.grid.grouping.ungroup',
            title: i18nService.get().grouping.ungroup,
            icon: 'ui-grid-icon-indent-left',
            shown: function() {
              return typeof(this.context.col.grouping) !== 'undefined' && typeof(this.context.col.grouping.groupPriority) !== 'undefined' && this.context.col.grouping.groupPriority >= 0;
            },
            action: function() {
              service.ungroupColumn(this.context.col.grid, this.context.col);
            }
          };
          var aggregateRemove = {
            name: 'ui.grid.grouping.aggregateRemove',
            title: i18nService.get().grouping.aggregate_remove,
            shown: function() {
              return typeof(this.context.col.treeAggregationFn) !== 'undefined';
            },
            action: function() {
              service.aggregateColumn(this.context.col.grid, this.context.col, null);
            }
          };
          var addAggregationMenu = function(type, title) {
            title = title || i18nService.get().grouping['aggregate_' + type] || type;
            var menuItem = {
              name: 'ui.grid.grouping.aggregate' + type,
              title: title,
              shown: function() {
                return typeof(this.context.col.treeAggregation) === 'undefined' || typeof(this.context.col.treeAggregation.type) === 'undefined' || this.context.col.treeAggregation.type !== type;
              },
              action: function() {
                service.aggregateColumn(this.context.col.grid, this.context.col, type);
              }
            };
            if (!gridUtil.arrayContainsObjectWithProperty(col.menuItems, 'name', 'ui.grid.grouping.aggregate' + type)) {
              col.menuItems.push(menuItem);
            }
          };
          if (col.colDef.groupingShowGroupingMenu !== false) {
            if (!gridUtil.arrayContainsObjectWithProperty(col.menuItems, 'name', 'ui.grid.grouping.group')) {
              col.menuItems.push(groupColumn);
            }
            if (!gridUtil.arrayContainsObjectWithProperty(col.menuItems, 'name', 'ui.grid.grouping.ungroup')) {
              col.menuItems.push(ungroupColumn);
            }
          }
          if (col.colDef.groupingShowAggregationMenu !== false) {
            angular.forEach(uiGridTreeBaseService.nativeAggregations(), function(aggregationDef, name) {
              addAggregationMenu(name);
            });
            angular.forEach(gridOptions.treeCustomAggregations, function(aggregationDef, name) {
              addAggregationMenu(name, aggregationDef.menuTitle);
            });
            if (!gridUtil.arrayContainsObjectWithProperty(col.menuItems, 'name', 'ui.grid.grouping.aggregateRemove')) {
              col.menuItems.push(aggregateRemove);
            }
          }
        },
        groupingColumnProcessor: function(columns, rows) {
          var grid = this;
          columns = service.moveGroupColumns(this, columns, rows);
          return columns;
        },
        groupedFinalizerFn: function(aggregation) {
          var col = this;
          if (typeof(aggregation.groupVal) !== 'undefined') {
            aggregation.rendered = aggregation.groupVal;
            if (col.grid.options.groupingShowCounts && col.colDef.type !== 'date') {
              aggregation.rendered += (' (' + aggregation.value + ')');
            }
          } else {
            aggregation.rendered = null;
          }
        },
        moveGroupColumns: function(grid, columns, rows) {
          if (grid.options.moveGroupColumns === false) {
            return columns;
          }
          columns.forEach(function(column, index) {
            column.groupingPosition = index;
          });
          columns.sort(function(a, b) {
            var a_group,
                b_group;
            if (a.isRowHeader) {
              a_group = -1000;
            } else if (typeof(a.grouping) === 'undefined' || typeof(a.grouping.groupPriority) === 'undefined' || a.grouping.groupPriority < 0) {
              a_group = null;
            } else {
              a_group = a.grouping.groupPriority;
            }
            if (b.isRowHeader) {
              b_group = -1000;
            } else if (typeof(b.grouping) === 'undefined' || typeof(b.grouping.groupPriority) === 'undefined' || b.grouping.groupPriority < 0) {
              b_group = null;
            } else {
              b_group = b.grouping.groupPriority;
            }
            if (a_group !== null && b_group === null) {
              return -1;
            }
            if (b_group !== null && a_group === null) {
              return 1;
            }
            if (a_group !== null && b_group !== null) {
              return a_group - b_group;
            }
            return a.groupingPosition - b.groupingPosition;
          });
          columns.forEach(function(column, index) {
            delete column.groupingPosition;
          });
          return columns;
        },
        groupColumn: function(grid, column) {
          if (typeof(column.grouping) === 'undefined') {
            column.grouping = {};
          }
          var existingGrouping = service.getGrouping(grid);
          column.grouping.groupPriority = existingGrouping.grouping.length;
          if (!column.sort) {
            column.sort = {direction: uiGridConstants.ASC};
          } else if (typeof(column.sort.direction) === 'undefined' || column.sort.direction === null) {
            column.sort.direction = uiGridConstants.ASC;
          }
          column.treeAggregation = {
            type: uiGridGroupingConstants.aggregation.COUNT,
            source: 'grouping'
          };
          column.treeAggregationFn = uiGridTreeBaseService.nativeAggregations()[uiGridGroupingConstants.aggregation.COUNT].aggregationFn;
          column.treeAggregationFinalizerFn = service.groupedFinalizerFn;
          grid.api.grouping.raise.groupingChanged(column);
          grid.api.core.raise.sortChanged(grid, grid.getColumnSorting());
          grid.queueGridRefresh();
        },
        ungroupColumn: function(grid, column) {
          if (typeof(column.grouping) === 'undefined') {
            return;
          }
          delete column.grouping.groupPriority;
          delete column.treeAggregation;
          delete column.customTreeAggregationFinalizer;
          service.tidyPriorities(grid);
          grid.api.grouping.raise.groupingChanged(column);
          grid.queueGridRefresh();
        },
        aggregateColumn: function(grid, column, aggregationType) {
          if (typeof(column.grouping) !== 'undefined' && typeof(column.grouping.groupPriority) !== 'undefined' && column.grouping.groupPriority >= 0) {
            service.ungroupColumn(grid, column);
          }
          var aggregationDef = {};
          if (typeof(grid.options.treeCustomAggregations[aggregationType]) !== 'undefined') {
            aggregationDef = grid.options.treeCustomAggregations[aggregationType];
          } else if (typeof(uiGridTreeBaseService.nativeAggregations()[aggregationType]) !== 'undefined') {
            aggregationDef = uiGridTreeBaseService.nativeAggregations()[aggregationType];
          }
          column.treeAggregation = {
            type: aggregationType,
            label: i18nService.get().aggregation[aggregationDef.label] || aggregationDef.label
          };
          column.treeAggregationFn = aggregationDef.aggregationFn;
          column.treeAggregationFinalizerFn = aggregationDef.finalizerFn;
          grid.api.grouping.raise.aggregationChanged(column);
          grid.queueGridRefresh();
        },
        setGrouping: function(grid, config) {
          if (typeof(config) === 'undefined') {
            return;
          }
          service.clearGrouping(grid);
          if (config.grouping && config.grouping.length && config.grouping.length > 0) {
            config.grouping.forEach(function(group) {
              var col = grid.getColumn(group.colName);
              if (col) {
                service.groupColumn(grid, col);
              }
            });
          }
          if (config.aggregations && config.aggregations.length) {
            config.aggregations.forEach(function(aggregation) {
              var col = grid.getColumn(aggregation.colName);
              if (col) {
                service.aggregateColumn(grid, col, aggregation.aggregation.type);
              }
            });
          }
          if (config.rowExpandedStates) {
            service.applyRowExpandedStates(grid.grouping.groupingHeaderCache, config.rowExpandedStates);
          }
        },
        clearGrouping: function(grid) {
          var currentGrouping = service.getGrouping(grid);
          if (currentGrouping.grouping.length > 0) {
            currentGrouping.grouping.forEach(function(group) {
              if (!group.col) {
                group.col = grid.getColumn(group.colName);
              }
              service.ungroupColumn(grid, group.col);
            });
          }
          if (currentGrouping.aggregations.length > 0) {
            currentGrouping.aggregations.forEach(function(aggregation) {
              if (!aggregation.col) {
                aggregation.col = grid.getColumn(aggregation.colName);
              }
              service.aggregateColumn(grid, aggregation.col, null);
            });
          }
        },
        tidyPriorities: function(grid) {
          if ((typeof(grid) === 'undefined' || typeof(grid.grid) !== 'undefined') && typeof(this.grid) !== 'undefined') {
            grid = this.grid;
          }
          var groupArray = [];
          var sortArray = [];
          grid.columns.forEach(function(column, index) {
            if (typeof(column.grouping) !== 'undefined' && typeof(column.grouping.groupPriority) !== 'undefined' && column.grouping.groupPriority >= 0) {
              groupArray.push(column);
            } else if (typeof(column.sort) !== 'undefined' && typeof(column.sort.priority) !== 'undefined' && column.sort.priority >= 0) {
              sortArray.push(column);
            }
          });
          groupArray.sort(function(a, b) {
            return a.grouping.groupPriority - b.grouping.groupPriority;
          });
          groupArray.forEach(function(column, index) {
            column.grouping.groupPriority = index;
            column.suppressRemoveSort = true;
            if (typeof(column.sort) === 'undefined') {
              column.sort = {};
            }
            column.sort.priority = index;
          });
          var i = groupArray.length;
          sortArray.sort(function(a, b) {
            return a.sort.priority - b.sort.priority;
          });
          sortArray.forEach(function(column, index) {
            column.sort.priority = i;
            column.suppressRemoveSort = column.colDef.suppressRemoveSort;
            i++;
          });
        },
        groupRows: function(renderableRows) {
          if (renderableRows.length === 0) {
            return renderableRows;
          }
          var grid = this;
          grid.grouping.oldGroupingHeaderCache = grid.grouping.groupingHeaderCache || {};
          grid.grouping.groupingHeaderCache = {};
          var processingState = service.initialiseProcessingState(grid);
          var updateProcessingState = function(groupFieldState, stateIndex) {
            var fieldValue = grid.getCellValue(row, groupFieldState.col);
            if (!groupFieldState.initialised || rowSorter.getSortFn(grid, groupFieldState.col, renderableRows)(fieldValue, groupFieldState.currentValue) !== 0) {
              service.insertGroupHeader(grid, renderableRows, i, processingState, stateIndex);
              i++;
            }
          };
          for (var i = 0; i < renderableRows.length; i++) {
            var row = renderableRows[i];
            if (row.visible) {
              processingState.forEach(updateProcessingState);
            }
          }
          delete grid.grouping.oldGroupingHeaderCache;
          return renderableRows;
        },
        initialiseProcessingState: function(grid) {
          var processingState = [];
          var columnSettings = service.getGrouping(grid);
          columnSettings.grouping.forEach(function(groupItem, index) {
            processingState.push({
              fieldName: groupItem.field,
              col: groupItem.col,
              initialised: false,
              currentValue: null,
              currentRow: null
            });
          });
          return processingState;
        },
        getGrouping: function(grid) {
          var groupArray = [];
          var aggregateArray = [];
          grid.columns.forEach(function(column, columnIndex) {
            if (column.grouping) {
              if (typeof(column.grouping.groupPriority) !== 'undefined' && column.grouping.groupPriority >= 0) {
                groupArray.push({
                  field: column.field,
                  col: column,
                  groupPriority: column.grouping.groupPriority,
                  grouping: column.grouping
                });
              }
            }
            if (column.treeAggregation && column.treeAggregation.type) {
              aggregateArray.push({
                field: column.field,
                col: column,
                aggregation: column.treeAggregation
              });
            }
          });
          groupArray.sort(function(a, b) {
            return a.groupPriority - b.groupPriority;
          });
          groupArray.forEach(function(group, index) {
            group.grouping.groupPriority = index;
            group.groupPriority = index;
            delete group.grouping;
          });
          return {
            grouping: groupArray,
            aggregations: aggregateArray
          };
        },
        insertGroupHeader: function(grid, renderableRows, rowIndex, processingState, stateIndex) {
          var fieldName = processingState[stateIndex].fieldName;
          var col = processingState[stateIndex].col;
          var newValue = grid.getCellValue(renderableRows[rowIndex], col);
          var newDisplayValue = newValue;
          if (typeof(newValue) === 'undefined' || newValue === null) {
            newDisplayValue = grid.options.groupingNullLabel;
          }
          var getKeyAsValueForCacheMap = function(key) {
            if (angular.isObject(key)) {
              return JSON.stringify(key);
            } else {
              return key;
            }
          };
          var cacheItem = grid.grouping.oldGroupingHeaderCache;
          for (var i = 0; i < stateIndex; i++) {
            if (cacheItem && cacheItem[getKeyAsValueForCacheMap(processingState[i].currentValue)]) {
              cacheItem = cacheItem[getKeyAsValueForCacheMap(processingState[i].currentValue)].children;
            }
          }
          var headerRow;
          if (cacheItem && cacheItem[getKeyAsValueForCacheMap(newValue)]) {
            headerRow = cacheItem[getKeyAsValueForCacheMap(newValue)].row;
            headerRow.entity = {};
          } else {
            headerRow = new GridRow({}, null, grid);
            gridClassFactory.rowTemplateAssigner.call(grid, headerRow);
          }
          headerRow.entity['$$' + processingState[stateIndex].col.uid] = {groupVal: newDisplayValue};
          headerRow.treeLevel = stateIndex;
          headerRow.groupHeader = true;
          headerRow.internalRow = true;
          headerRow.enableCellEdit = false;
          headerRow.enableSelection = grid.options.enableGroupHeaderSelection;
          processingState[stateIndex].initialised = true;
          processingState[stateIndex].currentValue = newValue;
          processingState[stateIndex].currentRow = headerRow;
          service.finaliseProcessingState(processingState, stateIndex + 1);
          renderableRows.splice(rowIndex, 0, headerRow);
          cacheItem = grid.grouping.groupingHeaderCache;
          for (i = 0; i < stateIndex; i++) {
            cacheItem = cacheItem[getKeyAsValueForCacheMap(processingState[i].currentValue)].children;
          }
          cacheItem[getKeyAsValueForCacheMap(newValue)] = {
            row: headerRow,
            children: {}
          };
        },
        finaliseProcessingState: function(processingState, stateIndex) {
          for (var i = stateIndex; i < processingState.length; i++) {
            processingState[i].initialised = false;
            processingState[i].currentRow = null;
            processingState[i].currentValue = null;
          }
        },
        getRowExpandedStates: function(treeChildren) {
          if (typeof(treeChildren) === 'undefined') {
            return {};
          }
          var newChildren = {};
          angular.forEach(treeChildren, function(value, key) {
            newChildren[key] = {state: value.row.treeNode.state};
            if (value.children) {
              newChildren[key].children = service.getRowExpandedStates(value.children);
            } else {
              newChildren[key].children = {};
            }
          });
          return newChildren;
        },
        applyRowExpandedStates: function(currentNode, expandedStates) {
          if (typeof(expandedStates) === 'undefined') {
            return;
          }
          angular.forEach(expandedStates, function(value, key) {
            if (currentNode[key]) {
              currentNode[key].row.treeNode.state = value.state;
              if (value.children && currentNode[key].children) {
                service.applyRowExpandedStates(currentNode[key].children, value.children);
              }
            }
          });
        }
      };
      return service;
    }]);
    module.directive('uiGridGrouping', ['uiGridGroupingConstants', 'uiGridGroupingService', '$templateCache', function(uiGridGroupingConstants, uiGridGroupingService, $templateCache) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        compile: function() {
          return {
            pre: function($scope, $elm, $attrs, uiGridCtrl) {
              if (uiGridCtrl.grid.options.enableGrouping !== false) {
                uiGridGroupingService.initializeGrid(uiGridCtrl.grid, $scope);
              }
            },
            post: function($scope, $elm, $attrs, uiGridCtrl) {}
          };
        }
      };
    }]);
  })();
  (function() {
    'use strict';
    var module = angular.module('ui.grid.importer', ['ui.grid']);
    module.constant('uiGridImporterConstants', {featureName: 'importer'});
    module.service('uiGridImporterService', ['$q', 'uiGridConstants', 'uiGridImporterConstants', 'gridUtil', '$compile', '$interval', 'i18nService', '$window', function($q, uiGridConstants, uiGridImporterConstants, gridUtil, $compile, $interval, i18nService, $window) {
      var service = {
        initializeGrid: function($scope, grid) {
          grid.importer = {$scope: $scope};
          this.defaultGridOptions(grid.options);
          var publicApi = {
            events: {importer: {}},
            methods: {importer: {importFile: function(fileObject) {
                  service.importThisFile(grid, fileObject);
                }}}
          };
          grid.api.registerEventsFromObject(publicApi.events);
          grid.api.registerMethodsFromObject(publicApi.methods);
          if (grid.options.enableImporter && grid.options.importerShowMenu) {
            if (grid.api.core.addToGridMenu) {
              service.addToMenu(grid);
            } else {
              $interval(function() {
                if (grid.api.core.addToGridMenu) {
                  service.addToMenu(grid);
                }
              }, 100, 1);
            }
          }
        },
        defaultGridOptions: function(gridOptions) {
          if (gridOptions.enableImporter || gridOptions.enableImporter === undefined) {
            if (!($window.hasOwnProperty('File') && $window.hasOwnProperty('FileReader') && $window.hasOwnProperty('FileList') && $window.hasOwnProperty('Blob'))) {
              gridUtil.logError('The File APIs are not fully supported in this browser, grid importer cannot be used.');
              gridOptions.enableImporter = false;
            } else {
              gridOptions.enableImporter = true;
            }
          } else {
            gridOptions.enableImporter = false;
          }
          gridOptions.importerProcessHeaders = gridOptions.importerProcessHeaders || service.processHeaders;
          gridOptions.importerHeaderFilter = gridOptions.importerHeaderFilter || function(displayName) {
            return displayName;
          };
          if (!gridOptions.importerErrorCallback || typeof(gridOptions.importerErrorCallback) !== 'function') {
            delete gridOptions.importerErrorCallback;
          }
          if (gridOptions.enableImporter === true && !gridOptions.importerDataAddCallback) {
            gridUtil.logError("You have not set an importerDataAddCallback, importer is disabled");
            gridOptions.enableImporter = false;
          }
          gridOptions.importerShowMenu = gridOptions.importerShowMenu !== false;
          gridOptions.importerObjectCallback = gridOptions.importerObjectCallback || function(grid, newObject) {
            return newObject;
          };
        },
        addToMenu: function(grid) {
          grid.api.core.addToGridMenu(grid, [{
            title: i18nService.getSafeText('gridMenu.importerTitle'),
            order: 150
          }, {
            templateUrl: 'ui-grid/importerMenuItemContainer',
            action: function($event) {
              this.grid.api.importer.importAFile(grid);
            },
            order: 151
          }]);
        },
        importThisFile: function(grid, fileObject) {
          if (!fileObject) {
            gridUtil.logError('No file object provided to importThisFile, should be impossible, aborting');
            return;
          }
          var reader = new FileReader();
          switch (fileObject.type) {
            case 'application/json':
              reader.onload = service.importJsonClosure(grid);
              break;
            default:
              reader.onload = service.importCsvClosure(grid);
              break;
          }
          reader.readAsText(fileObject);
        },
        importJsonClosure: function(grid) {
          return function(importFile) {
            var newObjects = [];
            var newObject;
            var importArray = service.parseJson(grid, importFile);
            if (importArray === null) {
              return;
            }
            importArray.forEach(function(value, index) {
              newObject = service.newObject(grid);
              angular.extend(newObject, value);
              newObject = grid.options.importerObjectCallback(grid, newObject);
              newObjects.push(newObject);
            });
            service.addObjects(grid, newObjects);
          };
        },
        parseJson: function(grid, importFile) {
          var loadedObjects;
          try {
            loadedObjects = JSON.parse(importFile.target.result);
          } catch (e) {
            service.alertError(grid, 'importer.invalidJson', 'File could not be processed, is it valid json? Content was: ', importFile.target.result);
            return;
          }
          if (!Array.isArray(loadedObjects)) {
            service.alertError(grid, 'importer.jsonNotarray', 'Import failed, file is not an array, file was: ', importFile.target.result);
            return [];
          } else {
            return loadedObjects;
          }
        },
        importCsvClosure: function(grid) {
          return function(importFile) {
            var importArray = service.parseCsv(importFile);
            if (!importArray || importArray.length < 1) {
              service.alertError(grid, 'importer.invalidCsv', 'File could not be processed, is it valid csv? Content was: ', importFile.target.result);
              return;
            }
            var newObjects = service.createCsvObjects(grid, importArray);
            if (!newObjects || newObjects.length === 0) {
              service.alertError(grid, 'importer.noObjects', 'Objects were not able to be derived, content was: ', importFile.target.result);
              return;
            }
            service.addObjects(grid, newObjects);
          };
        },
        parseCsv: function(importFile) {
          var csv = importFile.target.result;
          return CSV.parse(csv);
        },
        createCsvObjects: function(grid, importArray) {
          var headerMapping = grid.options.importerProcessHeaders(grid, importArray.shift());
          if (!headerMapping || headerMapping.length === 0) {
            service.alertError(grid, 'importer.noHeaders', 'Column names could not be derived, content was: ', importArray);
            return [];
          }
          var newObjects = [];
          var newObject;
          importArray.forEach(function(row, index) {
            newObject = service.newObject(grid);
            if (row !== null) {
              row.forEach(function(field, index) {
                if (headerMapping[index] !== null) {
                  newObject[headerMapping[index]] = field;
                }
              });
            }
            newObject = grid.options.importerObjectCallback(grid, newObject);
            newObjects.push(newObject);
          });
          return newObjects;
        },
        processHeaders: function(grid, headerRow) {
          var headers = [];
          if (!grid.options.columnDefs || grid.options.columnDefs.length === 0) {
            headerRow.forEach(function(value, index) {
              headers.push(value.replace(/[^0-9a-zA-Z\-_]/g, '_'));
            });
            return headers;
          } else {
            var lookupHash = service.flattenColumnDefs(grid, grid.options.columnDefs);
            headerRow.forEach(function(value, index) {
              if (lookupHash[value]) {
                headers.push(lookupHash[value]);
              } else if (lookupHash[value.toLowerCase()]) {
                headers.push(lookupHash[value.toLowerCase()]);
              } else {
                headers.push(null);
              }
            });
            return headers;
          }
        },
        flattenColumnDefs: function(grid, columnDefs) {
          var flattenedHash = {};
          columnDefs.forEach(function(columnDef, index) {
            if (columnDef.name) {
              flattenedHash[columnDef.name] = columnDef.field || columnDef.name;
              flattenedHash[columnDef.name.toLowerCase()] = columnDef.field || columnDef.name;
            }
            if (columnDef.field) {
              flattenedHash[columnDef.field] = columnDef.field || columnDef.name;
              flattenedHash[columnDef.field.toLowerCase()] = columnDef.field || columnDef.name;
            }
            if (columnDef.displayName) {
              flattenedHash[columnDef.displayName] = columnDef.field || columnDef.name;
              flattenedHash[columnDef.displayName.toLowerCase()] = columnDef.field || columnDef.name;
            }
            if (columnDef.displayName && grid.options.importerHeaderFilter) {
              flattenedHash[grid.options.importerHeaderFilter(columnDef.displayName)] = columnDef.field || columnDef.name;
              flattenedHash[grid.options.importerHeaderFilter(columnDef.displayName).toLowerCase()] = columnDef.field || columnDef.name;
            }
          });
          return flattenedHash;
        },
        addObjects: function(grid, newObjects, $scope) {
          if (grid.api.rowEdit) {
            var dataChangeDereg = grid.registerDataChangeCallback(function() {
              grid.api.rowEdit.setRowsDirty(newObjects);
              dataChangeDereg();
            }, [uiGridConstants.dataChange.ROW]);
            grid.importer.$scope.$on('$destroy', dataChangeDereg);
          }
          grid.importer.$scope.$apply(grid.options.importerDataAddCallback(grid, newObjects));
        },
        newObject: function(grid) {
          if (typeof(grid.options) !== "undefined" && typeof(grid.options.importerNewObject) !== "undefined") {
            return new grid.options.importerNewObject();
          } else {
            return {};
          }
        },
        alertError: function(grid, alertI18nToken, consoleMessage, context) {
          if (grid.options.importerErrorCallback) {
            grid.options.importerErrorCallback(grid, alertI18nToken, consoleMessage, context);
          } else {
            $window.alert(i18nService.getSafeText(alertI18nToken));
            gridUtil.logError(consoleMessage + context);
          }
        }
      };
      return service;
    }]);
    module.directive('uiGridImporter', ['uiGridImporterConstants', 'uiGridImporterService', 'gridUtil', '$compile', function(uiGridImporterConstants, uiGridImporterService, gridUtil, $compile) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          uiGridImporterService.initializeGrid($scope, uiGridCtrl.grid);
        }
      };
    }]);
    module.directive('uiGridImporterMenuItem', ['uiGridImporterConstants', 'uiGridImporterService', 'gridUtil', '$compile', function(uiGridImporterConstants, uiGridImporterService, gridUtil, $compile) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        templateUrl: 'ui-grid/importerMenuItem',
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          var handleFileSelect = function(event) {
            var target = event.srcElement || event.target;
            if (target && target.files && target.files.length === 1) {
              var fileObject = target.files[0];
              uiGridImporterService.importThisFile(grid, fileObject);
              target.form.reset();
            }
          };
          var fileChooser = $elm[0].querySelectorAll('.ui-grid-importer-file-chooser');
          var grid = uiGridCtrl.grid;
          if (fileChooser.length !== 1) {
            gridUtil.logError('Found > 1 or < 1 file choosers within the menu item, error, cannot continue');
          } else {
            fileChooser[0].addEventListener('change', handleFileSelect, false);
          }
        }
      };
    }]);
  })();
  (function() {
    'use strict';
    var module = angular.module('ui.grid.infiniteScroll', ['ui.grid']);
    module.service('uiGridInfiniteScrollService', ['gridUtil', '$compile', '$timeout', 'uiGridConstants', 'ScrollEvent', '$q', function(gridUtil, $compile, $timeout, uiGridConstants, ScrollEvent, $q) {
      var service = {
        initializeGrid: function(grid, $scope) {
          service.defaultGridOptions(grid.options);
          if (!grid.options.enableInfiniteScroll) {
            return;
          }
          grid.infiniteScroll = {dataLoading: false};
          service.setScrollDirections(grid, grid.options.infiniteScrollUp, grid.options.infiniteScrollDown);
          grid.api.core.on.scrollEnd($scope, service.handleScroll);
          var publicApi = {
            events: {infiniteScroll: {
                needLoadMoreData: function($scope, fn) {},
                needLoadMoreDataTop: function($scope, fn) {}
              }},
            methods: {infiniteScroll: {
                dataLoaded: function(scrollUp, scrollDown) {
                  service.setScrollDirections(grid, scrollUp, scrollDown);
                  var promise = service.adjustScroll(grid).then(function() {
                    grid.infiniteScroll.dataLoading = false;
                  });
                  return promise;
                },
                resetScroll: function(scrollUp, scrollDown) {
                  service.setScrollDirections(grid, scrollUp, scrollDown);
                  return service.adjustInfiniteScrollPosition(grid, 0);
                },
                saveScrollPercentage: function() {
                  grid.infiniteScroll.prevScrollTop = grid.renderContainers.body.prevScrollTop;
                  grid.infiniteScroll.previousVisibleRows = grid.getVisibleRowCount();
                },
                dataRemovedTop: function(scrollUp, scrollDown) {
                  service.dataRemovedTop(grid, scrollUp, scrollDown);
                },
                dataRemovedBottom: function(scrollUp, scrollDown) {
                  service.dataRemovedBottom(grid, scrollUp, scrollDown);
                },
                setScrollDirections: function(scrollUp, scrollDown) {
                  service.setScrollDirections(grid, scrollUp, scrollDown);
                }
              }}
          };
          grid.api.registerEventsFromObject(publicApi.events);
          grid.api.registerMethodsFromObject(publicApi.methods);
        },
        defaultGridOptions: function(gridOptions) {
          gridOptions.enableInfiniteScroll = gridOptions.enableInfiniteScroll !== false;
          gridOptions.infiniteScrollRowsFromEnd = gridOptions.infiniteScrollRowsFromEnd || 20;
          gridOptions.infiniteScrollUp = gridOptions.infiniteScrollUp === true;
          gridOptions.infiniteScrollDown = gridOptions.infiniteScrollDown !== false;
        },
        setScrollDirections: function(grid, scrollUp, scrollDown) {
          grid.infiniteScroll.scrollUp = (scrollUp === true);
          grid.suppressParentScrollUp = (scrollUp === true);
          grid.infiniteScroll.scrollDown = (scrollDown !== false);
          grid.suppressParentScrollDown = (scrollDown !== false);
        },
        handleScroll: function(args) {
          if (args.grid.infiniteScroll && args.grid.infiniteScroll.dataLoading || args.source === 'ui.grid.adjustInfiniteScrollPosition') {
            return;
          }
          if (args.y) {
            var percentage;
            var targetPercentage = args.grid.options.infiniteScrollRowsFromEnd / args.grid.renderContainers.body.visibleRowCache.length;
            if (args.grid.scrollDirection === uiGridConstants.scrollDirection.UP) {
              percentage = args.y.percentage;
              if (percentage <= targetPercentage) {
                service.loadData(args.grid);
              }
            } else if (args.grid.scrollDirection === uiGridConstants.scrollDirection.DOWN) {
              percentage = 1 - args.y.percentage;
              if (percentage <= targetPercentage) {
                service.loadData(args.grid);
              }
            }
          }
        },
        loadData: function(grid) {
          grid.infiniteScroll.previousVisibleRows = grid.renderContainers.body.visibleRowCache.length;
          grid.infiniteScroll.direction = grid.scrollDirection;
          delete grid.infiniteScroll.prevScrollTop;
          if (grid.scrollDirection === uiGridConstants.scrollDirection.UP && grid.infiniteScroll.scrollUp) {
            grid.infiniteScroll.dataLoading = true;
            grid.api.infiniteScroll.raise.needLoadMoreDataTop();
          } else if (grid.scrollDirection === uiGridConstants.scrollDirection.DOWN && grid.infiniteScroll.scrollDown) {
            grid.infiniteScroll.dataLoading = true;
            grid.api.infiniteScroll.raise.needLoadMoreData();
          }
        },
        adjustScroll: function(grid) {
          var promise = $q.defer();
          $timeout(function() {
            var newPercentage,
                viewportHeight,
                rowHeight,
                newVisibleRows,
                oldTop,
                newTop;
            viewportHeight = grid.getViewportHeight() + grid.headerHeight - grid.renderContainers.body.headerHeight - grid.scrollbarHeight;
            rowHeight = grid.options.rowHeight;
            if (grid.infiniteScroll.direction === undefined) {
              service.adjustInfiniteScrollPosition(grid, 0);
            }
            newVisibleRows = grid.getVisibleRowCount();
            var canvasHeight = rowHeight * newVisibleRows;
            if (grid.infiniteScroll.scrollDown && (viewportHeight > canvasHeight)) {
              grid.api.infiniteScroll.raise.needLoadMoreData();
            }
            if (grid.infiniteScroll.direction === uiGridConstants.scrollDirection.UP) {
              oldTop = grid.infiniteScroll.prevScrollTop || 0;
              newTop = oldTop + (newVisibleRows - grid.infiniteScroll.previousVisibleRows) * rowHeight;
              service.adjustInfiniteScrollPosition(grid, newTop);
              $timeout(function() {
                promise.resolve();
              });
            }
            if (grid.infiniteScroll.direction === uiGridConstants.scrollDirection.DOWN) {
              newTop = grid.infiniteScroll.prevScrollTop || (grid.infiniteScroll.previousVisibleRows * rowHeight - viewportHeight);
              service.adjustInfiniteScrollPosition(grid, newTop);
              $timeout(function() {
                promise.resolve();
              });
            }
          }, 0);
          return promise.promise;
        },
        adjustInfiniteScrollPosition: function(grid, scrollTop) {
          var scrollEvent = new ScrollEvent(grid, null, null, 'ui.grid.adjustInfiniteScrollPosition'),
              visibleRows = grid.getVisibleRowCount(),
              viewportHeight = grid.getViewportHeight() + grid.headerHeight - grid.renderContainers.body.headerHeight - grid.scrollbarHeight,
              rowHeight = grid.options.rowHeight,
              scrollHeight = visibleRows * rowHeight - viewportHeight;
          if (scrollTop === 0 && grid.infiniteScroll.scrollUp) {
            scrollEvent.y = {percentage: 1 / scrollHeight};
          } else {
            scrollEvent.y = {percentage: scrollTop / scrollHeight};
          }
          grid.scrollContainers('', scrollEvent);
        },
        dataRemovedTop: function(grid, scrollUp, scrollDown) {
          var newVisibleRows,
              oldTop,
              newTop,
              rowHeight;
          service.setScrollDirections(grid, scrollUp, scrollDown);
          newVisibleRows = grid.renderContainers.body.visibleRowCache.length;
          oldTop = grid.infiniteScroll.prevScrollTop;
          rowHeight = grid.options.rowHeight;
          newTop = oldTop - (grid.infiniteScroll.previousVisibleRows - newVisibleRows) * rowHeight;
          return service.adjustInfiniteScrollPosition(grid, newTop);
        },
        dataRemovedBottom: function(grid, scrollUp, scrollDown) {
          var newTop;
          service.setScrollDirections(grid, scrollUp, scrollDown);
          newTop = grid.infiniteScroll.prevScrollTop;
          return service.adjustInfiniteScrollPosition(grid, newTop);
        }
      };
      return service;
    }]);
    module.directive('uiGridInfiniteScroll', ['uiGridInfiniteScrollService', function(uiGridInfiniteScrollService) {
      return {
        priority: -200,
        scope: false,
        require: '^uiGrid',
        compile: function($scope, $elm, $attr) {
          return {
            pre: function($scope, $elm, $attr, uiGridCtrl) {
              uiGridInfiniteScrollService.initializeGrid(uiGridCtrl.grid, $scope);
            },
            post: function($scope, $elm, $attr) {}
          };
        }
      };
    }]);
  })();
  (function() {
    'use strict';
    var module = angular.module('ui.grid.moveColumns', ['ui.grid']);
    module.service('uiGridMoveColumnService', ['$q', '$timeout', '$log', 'ScrollEvent', 'uiGridConstants', 'gridUtil', function($q, $timeout, $log, ScrollEvent, uiGridConstants, gridUtil) {
      var service = {
        initializeGrid: function(grid) {
          var self = this;
          this.registerPublicApi(grid);
          this.defaultGridOptions(grid.options);
          grid.moveColumns = {orderCache: []};
          grid.registerColumnBuilder(self.movableColumnBuilder);
          grid.registerDataChangeCallback(self.verifyColumnOrder, [uiGridConstants.dataChange.COLUMN]);
        },
        registerPublicApi: function(grid) {
          var self = this;
          var publicApi = {
            events: {colMovable: {columnPositionChanged: function(colDef, originalPosition, newPosition) {}}},
            methods: {colMovable: {moveColumn: function(originalPosition, finalPosition) {
                  var columns = grid.columns;
                  if (!angular.isNumber(originalPosition) || !angular.isNumber(finalPosition)) {
                    gridUtil.logError('MoveColumn: Please provide valid values for originalPosition and finalPosition');
                    return;
                  }
                  var nonMovableColumns = 0;
                  for (var i = 0; i < columns.length; i++) {
                    if ((angular.isDefined(columns[i].colDef.visible) && columns[i].colDef.visible === false) || columns[i].isRowHeader === true) {
                      nonMovableColumns++;
                    }
                  }
                  if (originalPosition >= (columns.length - nonMovableColumns) || finalPosition >= (columns.length - nonMovableColumns)) {
                    gridUtil.logError('MoveColumn: Invalid values for originalPosition, finalPosition');
                    return;
                  }
                  var findPositionForRenderIndex = function(index) {
                    var position = index;
                    for (var i = 0; i <= position; i++) {
                      if (angular.isDefined(columns[i]) && ((angular.isDefined(columns[i].colDef.visible) && columns[i].colDef.visible === false) || columns[i].isRowHeader === true)) {
                        position++;
                      }
                    }
                    return position;
                  };
                  self.redrawColumnAtPosition(grid, findPositionForRenderIndex(originalPosition), findPositionForRenderIndex(finalPosition));
                }}}
          };
          grid.api.registerEventsFromObject(publicApi.events);
          grid.api.registerMethodsFromObject(publicApi.methods);
        },
        defaultGridOptions: function(gridOptions) {
          gridOptions.enableColumnMoving = gridOptions.enableColumnMoving !== false;
        },
        movableColumnBuilder: function(colDef, col, gridOptions) {
          var promises = [];
          colDef.enableColumnMoving = colDef.enableColumnMoving === undefined ? gridOptions.enableColumnMoving : colDef.enableColumnMoving;
          return $q.all(promises);
        },
        updateColumnCache: function(grid) {
          grid.moveColumns.orderCache = grid.getOnlyDataColumns();
        },
        verifyColumnOrder: function(grid) {
          var headerRowOffset = grid.rowHeaderColumns.length;
          var newIndex;
          angular.forEach(grid.moveColumns.orderCache, function(cacheCol, cacheIndex) {
            newIndex = grid.columns.indexOf(cacheCol);
            if (newIndex !== -1 && newIndex - headerRowOffset !== cacheIndex) {
              var column = grid.columns.splice(newIndex, 1)[0];
              grid.columns.splice(cacheIndex + headerRowOffset, 0, column);
            }
          });
        },
        redrawColumnAtPosition: function(grid, originalPosition, newPosition) {
          if (originalPosition === newPosition) {
            return;
          }
          var columns = grid.columns;
          var originalColumn = columns[originalPosition];
          if (originalColumn.colDef.enableColumnMoving) {
            if (originalPosition > newPosition) {
              for (var i1 = originalPosition; i1 > newPosition; i1--) {
                columns[i1] = columns[i1 - 1];
              }
            } else if (newPosition > originalPosition) {
              for (var i2 = originalPosition; i2 < newPosition; i2++) {
                columns[i2] = columns[i2 + 1];
              }
            }
            columns[newPosition] = originalColumn;
            service.updateColumnCache(grid);
            grid.queueGridRefresh();
            $timeout(function() {
              grid.api.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
              grid.api.colMovable.raise.columnPositionChanged(originalColumn.colDef, originalPosition, newPosition);
            });
          }
        }
      };
      return service;
    }]);
    module.directive('uiGridMoveColumns', ['uiGridMoveColumnService', function(uiGridMoveColumnService) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        compile: function() {
          return {
            pre: function($scope, $elm, $attrs, uiGridCtrl) {
              uiGridMoveColumnService.initializeGrid(uiGridCtrl.grid);
            },
            post: function($scope, $elm, $attrs, uiGridCtrl) {}
          };
        }
      };
    }]);
    module.directive('uiGridHeaderCell', ['$q', 'gridUtil', 'uiGridMoveColumnService', '$document', '$log', 'uiGridConstants', 'ScrollEvent', function($q, gridUtil, uiGridMoveColumnService, $document, $log, uiGridConstants, ScrollEvent) {
      return {
        priority: -10,
        require: '^uiGrid',
        compile: function() {
          return {post: function($scope, $elm, $attrs, uiGridCtrl) {
              if ($scope.col.colDef.enableColumnMoving) {
                var $contentsElm = angular.element($elm[0].querySelectorAll('.ui-grid-cell-contents'));
                var gridLeft;
                var previousMouseX;
                var totalMouseMovement;
                var rightMoveLimit;
                var elmCloned = false;
                var movingElm;
                var reducedWidth;
                var moveOccurred = false;
                var downFn = function(event) {
                  gridLeft = $scope.grid.element[0].getBoundingClientRect().left;
                  if ($scope.grid.hasLeftContainer()) {
                    gridLeft += $scope.grid.renderContainers.left.header[0].getBoundingClientRect().width;
                  }
                  previousMouseX = event.pageX;
                  totalMouseMovement = 0;
                  rightMoveLimit = gridLeft + $scope.grid.getViewportWidth();
                  if (event.type === 'mousedown') {
                    $document.on('mousemove', moveFn);
                    $document.on('mouseup', upFn);
                  } else if (event.type === 'touchstart') {
                    $document.on('touchmove', moveFn);
                    $document.on('touchend', upFn);
                  }
                };
                var moveFn = function(event) {
                  var changeValue = event.pageX - previousMouseX;
                  if (changeValue === 0) {
                    return;
                  }
                  document.onselectstart = function() {
                    return false;
                  };
                  moveOccurred = true;
                  if (!elmCloned) {
                    cloneElement();
                  } else if (elmCloned) {
                    moveElement(changeValue);
                    previousMouseX = event.pageX;
                  }
                };
                var upFn = function(event) {
                  document.onselectstart = null;
                  if (movingElm) {
                    movingElm.remove();
                    elmCloned = false;
                  }
                  offAllEvents();
                  onDownEvents();
                  if (!moveOccurred) {
                    return;
                  }
                  var columns = $scope.grid.columns;
                  var columnIndex = 0;
                  for (var i = 0; i < columns.length; i++) {
                    if (columns[i].colDef.name !== $scope.col.colDef.name) {
                      columnIndex++;
                    } else {
                      break;
                    }
                  }
                  var targetIndex;
                  if (totalMouseMovement < 0) {
                    var totalColumnsLeftWidth = 0;
                    var il;
                    if ($scope.grid.isRTL()) {
                      for (il = columnIndex + 1; il < columns.length; il++) {
                        if (angular.isUndefined(columns[il].colDef.visible) || columns[il].colDef.visible === true) {
                          totalColumnsLeftWidth += columns[il].drawnWidth || columns[il].width || columns[il].colDef.width;
                          if (totalColumnsLeftWidth > Math.abs(totalMouseMovement)) {
                            uiGridMoveColumnService.redrawColumnAtPosition($scope.grid, columnIndex, il - 1);
                            break;
                          }
                        }
                      }
                    } else {
                      for (il = columnIndex - 1; il >= 0; il--) {
                        if (angular.isUndefined(columns[il].colDef.visible) || columns[il].colDef.visible === true) {
                          totalColumnsLeftWidth += columns[il].drawnWidth || columns[il].width || columns[il].colDef.width;
                          if (totalColumnsLeftWidth > Math.abs(totalMouseMovement)) {
                            uiGridMoveColumnService.redrawColumnAtPosition($scope.grid, columnIndex, il + 1);
                            break;
                          }
                        }
                      }
                    }
                    if (totalColumnsLeftWidth < Math.abs(totalMouseMovement)) {
                      targetIndex = 0;
                      if ($scope.grid.isRTL()) {
                        targetIndex = columns.length - 1;
                      }
                      uiGridMoveColumnService.redrawColumnAtPosition($scope.grid, columnIndex, targetIndex);
                    }
                  } else if (totalMouseMovement > 0) {
                    var totalColumnsRightWidth = 0;
                    var ir;
                    if ($scope.grid.isRTL()) {
                      for (ir = columnIndex - 1; ir > 0; ir--) {
                        if (angular.isUndefined(columns[ir].colDef.visible) || columns[ir].colDef.visible === true) {
                          totalColumnsRightWidth += columns[ir].drawnWidth || columns[ir].width || columns[ir].colDef.width;
                          if (totalColumnsRightWidth > totalMouseMovement) {
                            uiGridMoveColumnService.redrawColumnAtPosition($scope.grid, columnIndex, ir);
                            break;
                          }
                        }
                      }
                    } else {
                      for (ir = columnIndex + 1; ir < columns.length; ir++) {
                        if (angular.isUndefined(columns[ir].colDef.visible) || columns[ir].colDef.visible === true) {
                          totalColumnsRightWidth += columns[ir].drawnWidth || columns[ir].width || columns[ir].colDef.width;
                          if (totalColumnsRightWidth > totalMouseMovement) {
                            uiGridMoveColumnService.redrawColumnAtPosition($scope.grid, columnIndex, ir - 1);
                            break;
                          }
                        }
                      }
                    }
                    if (totalColumnsRightWidth < totalMouseMovement) {
                      targetIndex = columns.length - 1;
                      if ($scope.grid.isRTL()) {
                        targetIndex = 0;
                      }
                      uiGridMoveColumnService.redrawColumnAtPosition($scope.grid, columnIndex, targetIndex);
                    }
                  }
                };
                var onDownEvents = function() {
                  $contentsElm.on('touchstart', downFn);
                  $contentsElm.on('mousedown', downFn);
                };
                var offAllEvents = function() {
                  $contentsElm.off('touchstart', downFn);
                  $contentsElm.off('mousedown', downFn);
                  $document.off('mousemove', moveFn);
                  $document.off('touchmove', moveFn);
                  $document.off('mouseup', upFn);
                  $document.off('touchend', upFn);
                };
                onDownEvents();
                var cloneElement = function() {
                  elmCloned = true;
                  movingElm = $elm.clone();
                  $elm.parent().append(movingElm);
                  movingElm.addClass('movingColumn');
                  var movingElementStyles = {};
                  movingElementStyles.left = $elm[0].offsetLeft + 'px';
                  var gridRight = $scope.grid.element[0].getBoundingClientRect().right;
                  var elmRight = $elm[0].getBoundingClientRect().right;
                  if (elmRight > gridRight) {
                    reducedWidth = $scope.col.drawnWidth + (gridRight - elmRight);
                    movingElementStyles.width = reducedWidth + 'px';
                  }
                  movingElm.css(movingElementStyles);
                };
                var moveElement = function(changeValue) {
                  var columns = $scope.grid.columns;
                  var totalColumnWidth = 0;
                  for (var i = 0; i < columns.length; i++) {
                    if (angular.isUndefined(columns[i].colDef.visible) || columns[i].colDef.visible === true) {
                      totalColumnWidth += columns[i].drawnWidth || columns[i].width || columns[i].colDef.width;
                    }
                  }
                  var currentElmLeft = movingElm[0].getBoundingClientRect().left - 1;
                  var currentElmRight = movingElm[0].getBoundingClientRect().right;
                  var newElementLeft;
                  newElementLeft = currentElmLeft - gridLeft + changeValue;
                  newElementLeft = newElementLeft < rightMoveLimit ? newElementLeft : rightMoveLimit;
                  if ((currentElmLeft >= gridLeft || changeValue > 0) && (currentElmRight <= rightMoveLimit || changeValue < 0)) {
                    movingElm.css({
                      visibility: 'visible',
                      'left': (movingElm[0].offsetLeft + (newElementLeft < rightMoveLimit ? changeValue : (rightMoveLimit - currentElmLeft))) + 'px'
                    });
                  } else if (totalColumnWidth > Math.ceil(uiGridCtrl.grid.gridWidth)) {
                    changeValue *= 8;
                    var scrollEvent = new ScrollEvent($scope.col.grid, null, null, 'uiGridHeaderCell.moveElement');
                    scrollEvent.x = {pixels: changeValue};
                    scrollEvent.grid.scrollContainers('', scrollEvent);
                  }
                  var totalColumnsLeftWidth = 0;
                  for (var il = 0; il < columns.length; il++) {
                    if (angular.isUndefined(columns[il].colDef.visible) || columns[il].colDef.visible === true) {
                      if (columns[il].colDef.name !== $scope.col.colDef.name) {
                        totalColumnsLeftWidth += columns[il].drawnWidth || columns[il].width || columns[il].colDef.width;
                      } else {
                        break;
                      }
                    }
                  }
                  if ($scope.newScrollLeft === undefined) {
                    totalMouseMovement += changeValue;
                  } else {
                    totalMouseMovement = $scope.newScrollLeft + newElementLeft - totalColumnsLeftWidth;
                  }
                  if (reducedWidth < $scope.col.drawnWidth) {
                    reducedWidth += Math.abs(changeValue);
                    movingElm.css({'width': reducedWidth + 'px'});
                  }
                };
              }
            }};
        }
      };
    }]);
  })();
  (function() {
    'use strict';
    var module = angular.module('ui.grid.pagination', ['ng', 'ui.grid']);
    module.service('uiGridPaginationService', ['gridUtil', function(gridUtil) {
      var service = {
        initializeGrid: function(grid) {
          service.defaultGridOptions(grid.options);
          var publicApi = {
            events: {pagination: {paginationChanged: function(currentPage, pageSize) {}}},
            methods: {pagination: {
                getPage: function() {
                  return grid.options.enablePagination ? grid.options.paginationCurrentPage : null;
                },
                getTotalPages: function() {
                  if (!grid.options.enablePagination) {
                    return null;
                  }
                  return (grid.options.totalItems === 0) ? 1 : Math.ceil(grid.options.totalItems / grid.options.paginationPageSize);
                },
                nextPage: function() {
                  if (!grid.options.enablePagination) {
                    return;
                  }
                  if (grid.options.totalItems > 0) {
                    grid.options.paginationCurrentPage = Math.min(grid.options.paginationCurrentPage + 1, publicApi.methods.pagination.getTotalPages());
                  } else {
                    grid.options.paginationCurrentPage++;
                  }
                },
                previousPage: function() {
                  if (!grid.options.enablePagination) {
                    return;
                  }
                  grid.options.paginationCurrentPage = Math.max(grid.options.paginationCurrentPage - 1, 1);
                },
                seek: function(page) {
                  if (!grid.options.enablePagination) {
                    return;
                  }
                  if (!angular.isNumber(page) || page < 1) {
                    throw 'Invalid page number: ' + page;
                  }
                  grid.options.paginationCurrentPage = Math.min(page, publicApi.methods.pagination.getTotalPages());
                }
              }}
          };
          grid.api.registerEventsFromObject(publicApi.events);
          grid.api.registerMethodsFromObject(publicApi.methods);
          var processPagination = function(renderableRows) {
            if (grid.options.useExternalPagination || !grid.options.enablePagination) {
              return renderableRows;
            }
            var pageSize = parseInt(grid.options.paginationPageSize, 10);
            var currentPage = parseInt(grid.options.paginationCurrentPage, 10);
            var visibleRows = renderableRows.filter(function(row) {
              return row.visible;
            });
            grid.options.totalItems = visibleRows.length;
            var firstRow = (currentPage - 1) * pageSize;
            if (firstRow > visibleRows.length) {
              currentPage = grid.options.paginationCurrentPage = 1;
              firstRow = (currentPage - 1) * pageSize;
            }
            return visibleRows.slice(firstRow, firstRow + pageSize);
          };
          grid.registerRowsProcessor(processPagination, 900);
        },
        defaultGridOptions: function(gridOptions) {
          gridOptions.enablePagination = gridOptions.enablePagination !== false;
          gridOptions.enablePaginationControls = gridOptions.enablePaginationControls !== false;
          gridOptions.useExternalPagination = gridOptions.useExternalPagination === true;
          if (gridUtil.isNullOrUndefined(gridOptions.totalItems)) {
            gridOptions.totalItems = 0;
          }
          if (gridUtil.isNullOrUndefined(gridOptions.paginationPageSizes)) {
            gridOptions.paginationPageSizes = [250, 500, 1000];
          }
          if (gridUtil.isNullOrUndefined(gridOptions.paginationPageSize)) {
            if (gridOptions.paginationPageSizes.length > 0) {
              gridOptions.paginationPageSize = gridOptions.paginationPageSizes[0];
            } else {
              gridOptions.paginationPageSize = 0;
            }
          }
          if (gridUtil.isNullOrUndefined(gridOptions.paginationCurrentPage)) {
            gridOptions.paginationCurrentPage = 1;
          }
          if (gridUtil.isNullOrUndefined(gridOptions.paginationTemplate)) {
            gridOptions.paginationTemplate = 'ui-grid/pagination';
          }
        },
        onPaginationChanged: function(grid, currentPage, pageSize) {
          grid.api.pagination.raise.paginationChanged(currentPage, pageSize);
          if (!grid.options.useExternalPagination) {
            grid.queueGridRefresh();
          }
        }
      };
      return service;
    }]);
    module.directive('uiGridPagination', ['gridUtil', 'uiGridPaginationService', function(gridUtil, uiGridPaginationService) {
      return {
        priority: -200,
        scope: false,
        require: 'uiGrid',
        link: {pre: function($scope, $elm, $attr, uiGridCtrl) {
            uiGridPaginationService.initializeGrid(uiGridCtrl.grid);
            gridUtil.getTemplate(uiGridCtrl.grid.options.paginationTemplate).then(function(contents) {
              var template = angular.element(contents);
              $elm.append(template);
              uiGridCtrl.innerCompile(template);
            });
          }}
      };
    }]);
    module.directive('uiGridPager', ['uiGridPaginationService', 'uiGridConstants', 'gridUtil', 'i18nService', function(uiGridPaginationService, uiGridConstants, gridUtil, i18nService) {
      return {
        priority: -200,
        scope: true,
        require: '^uiGrid',
        link: function($scope, $elm, $attr, uiGridCtrl) {
          var defaultFocusElementSelector = '.ui-grid-pager-control-input';
          $scope.aria = i18nService.getSafeText('pagination.aria');
          $scope.paginationApi = uiGridCtrl.grid.api.pagination;
          $scope.sizesLabel = i18nService.getSafeText('pagination.sizes');
          $scope.totalItemsLabel = i18nService.getSafeText('pagination.totalItems');
          $scope.paginationOf = i18nService.getSafeText('pagination.of');
          $scope.paginationThrough = i18nService.getSafeText('pagination.through');
          var options = uiGridCtrl.grid.options;
          uiGridCtrl.grid.renderContainers.body.registerViewportAdjuster(function(adjustment) {
            adjustment.height = adjustment.height - gridUtil.elementHeight($elm, "padding");
            return adjustment;
          });
          var dataChangeDereg = uiGridCtrl.grid.registerDataChangeCallback(function(grid) {
            if (!grid.options.useExternalPagination) {
              grid.options.totalItems = grid.rows.length;
            }
          }, [uiGridConstants.dataChange.ROW]);
          $scope.$on('$destroy', dataChangeDereg);
          var setShowing = function() {
            $scope.showingLow = ((options.paginationCurrentPage - 1) * options.paginationPageSize) + 1;
            $scope.showingHigh = Math.min(options.paginationCurrentPage * options.paginationPageSize, options.totalItems);
          };
          var deregT = $scope.$watch('grid.options.totalItems + grid.options.paginationPageSize', setShowing);
          var deregP = $scope.$watch('grid.options.paginationCurrentPage + grid.options.paginationPageSize', function(newValues, oldValues) {
            if (newValues === oldValues || oldValues === undefined) {
              return;
            }
            if (!angular.isNumber(options.paginationCurrentPage) || options.paginationCurrentPage < 1) {
              options.paginationCurrentPage = 1;
              return;
            }
            if (options.totalItems > 0 && options.paginationCurrentPage > $scope.paginationApi.getTotalPages()) {
              options.paginationCurrentPage = $scope.paginationApi.getTotalPages();
              return;
            }
            setShowing();
            uiGridPaginationService.onPaginationChanged($scope.grid, options.paginationCurrentPage, options.paginationPageSize);
          });
          $scope.$on('$destroy', function() {
            deregT();
            deregP();
          });
          $scope.cantPageForward = function() {
            if (options.totalItems > 0) {
              return options.paginationCurrentPage >= $scope.paginationApi.getTotalPages();
            } else {
              return options.data.length < 1;
            }
          };
          $scope.cantPageToLast = function() {
            if (options.totalItems > 0) {
              return $scope.cantPageForward();
            } else {
              return true;
            }
          };
          $scope.cantPageBackward = function() {
            return options.paginationCurrentPage <= 1;
          };
          var focusToInputIf = function(condition) {
            if (condition) {
              gridUtil.focus.bySelector($elm, defaultFocusElementSelector);
            }
          };
          $scope.pageFirstPageClick = function() {
            $scope.paginationApi.seek(1);
            focusToInputIf($scope.cantPageBackward());
          };
          $scope.pagePreviousPageClick = function() {
            $scope.paginationApi.previousPage();
            focusToInputIf($scope.cantPageBackward());
          };
          $scope.pageNextPageClick = function() {
            $scope.paginationApi.nextPage();
            focusToInputIf($scope.cantPageForward());
          };
          $scope.pageLastPageClick = function() {
            $scope.paginationApi.seek($scope.paginationApi.getTotalPages());
            focusToInputIf($scope.cantPageToLast());
          };
        }
      };
    }]);
  })();
  (function() {
    'use strict';
    var module = angular.module('ui.grid.pinning', ['ui.grid']);
    module.constant('uiGridPinningConstants', {container: {
        LEFT: 'left',
        RIGHT: 'right',
        NONE: ''
      }});
    module.service('uiGridPinningService', ['gridUtil', 'GridRenderContainer', 'i18nService', 'uiGridPinningConstants', function(gridUtil, GridRenderContainer, i18nService, uiGridPinningConstants) {
      var service = {
        initializeGrid: function(grid) {
          service.defaultGridOptions(grid.options);
          grid.registerColumnBuilder(service.pinningColumnBuilder);
          var publicApi = {
            events: {pinning: {columnPinned: function(colDef, container) {}}},
            methods: {pinning: {pinColumn: function(col, container) {
                  service.pinColumn(grid, col, container);
                }}}
          };
          grid.api.registerEventsFromObject(publicApi.events);
          grid.api.registerMethodsFromObject(publicApi.methods);
        },
        defaultGridOptions: function(gridOptions) {
          gridOptions.enablePinning = gridOptions.enablePinning !== false;
        },
        pinningColumnBuilder: function(colDef, col, gridOptions) {
          colDef.enablePinning = colDef.enablePinning === undefined ? gridOptions.enablePinning : colDef.enablePinning;
          if (colDef.pinnedLeft) {
            col.renderContainer = 'left';
            col.grid.createLeftContainer();
          } else if (colDef.pinnedRight) {
            col.renderContainer = 'right';
            col.grid.createRightContainer();
          }
          if (!colDef.enablePinning) {
            return;
          }
          var pinColumnLeftAction = {
            name: 'ui.grid.pinning.pinLeft',
            title: i18nService.get().pinning.pinLeft,
            icon: 'ui-grid-icon-left-open',
            shown: function() {
              return typeof(this.context.col.renderContainer) === 'undefined' || !this.context.col.renderContainer || this.context.col.renderContainer !== 'left';
            },
            action: function() {
              service.pinColumn(this.context.col.grid, this.context.col, uiGridPinningConstants.container.LEFT);
            }
          };
          var pinColumnRightAction = {
            name: 'ui.grid.pinning.pinRight',
            title: i18nService.get().pinning.pinRight,
            icon: 'ui-grid-icon-right-open',
            shown: function() {
              return typeof(this.context.col.renderContainer) === 'undefined' || !this.context.col.renderContainer || this.context.col.renderContainer !== 'right';
            },
            action: function() {
              service.pinColumn(this.context.col.grid, this.context.col, uiGridPinningConstants.container.RIGHT);
            }
          };
          var removePinAction = {
            name: 'ui.grid.pinning.unpin',
            title: i18nService.get().pinning.unpin,
            icon: 'ui-grid-icon-cancel',
            shown: function() {
              return typeof(this.context.col.renderContainer) !== 'undefined' && this.context.col.renderContainer !== null && this.context.col.renderContainer !== 'body';
            },
            action: function() {
              service.pinColumn(this.context.col.grid, this.context.col, uiGridPinningConstants.container.NONE);
            }
          };
          if (!gridUtil.arrayContainsObjectWithProperty(col.menuItems, 'name', 'ui.grid.pinning.pinLeft')) {
            col.menuItems.push(pinColumnLeftAction);
          }
          if (!gridUtil.arrayContainsObjectWithProperty(col.menuItems, 'name', 'ui.grid.pinning.pinRight')) {
            col.menuItems.push(pinColumnRightAction);
          }
          if (!gridUtil.arrayContainsObjectWithProperty(col.menuItems, 'name', 'ui.grid.pinning.unpin')) {
            col.menuItems.push(removePinAction);
          }
        },
        pinColumn: function(grid, col, container) {
          if (container === uiGridPinningConstants.container.NONE) {
            col.renderContainer = null;
            col.colDef.pinnedLeft = col.colDef.pinnedRight = false;
          } else {
            col.renderContainer = container;
            if (container === uiGridPinningConstants.container.LEFT) {
              grid.createLeftContainer();
            } else if (container === uiGridPinningConstants.container.RIGHT) {
              grid.createRightContainer();
            }
          }
          grid.refresh().then(function() {
            grid.api.pinning.raise.columnPinned(col.colDef, container);
          });
        }
      };
      return service;
    }]);
    module.directive('uiGridPinning', ['gridUtil', 'uiGridPinningService', function(gridUtil, uiGridPinningService) {
      return {
        require: 'uiGrid',
        scope: false,
        compile: function() {
          return {
            pre: function($scope, $elm, $attrs, uiGridCtrl) {
              uiGridPinningService.initializeGrid(uiGridCtrl.grid);
            },
            post: function($scope, $elm, $attrs, uiGridCtrl) {}
          };
        }
      };
    }]);
  })();
  (function() {
    'use strict';
    var module = angular.module('ui.grid.resizeColumns', ['ui.grid']);
    module.service('uiGridResizeColumnsService', ['gridUtil', '$q', '$timeout', function(gridUtil, $q, $timeout) {
      var service = {
        defaultGridOptions: function(gridOptions) {
          gridOptions.enableColumnResizing = gridOptions.enableColumnResizing !== false;
          if (gridOptions.enableColumnResize === false) {
            gridOptions.enableColumnResizing = false;
          }
        },
        colResizerColumnBuilder: function(colDef, col, gridOptions) {
          var promises = [];
          colDef.enableColumnResizing = colDef.enableColumnResizing === undefined ? gridOptions.enableColumnResizing : colDef.enableColumnResizing;
          if (colDef.enableColumnResize === false) {
            colDef.enableColumnResizing = false;
          }
          return $q.all(promises);
        },
        registerPublicApi: function(grid) {
          var publicApi = {events: {colResizable: {columnSizeChanged: function(colDef, deltaChange) {}}}};
          grid.api.registerEventsFromObject(publicApi.events);
        },
        fireColumnSizeChanged: function(grid, colDef, deltaChange) {
          $timeout(function() {
            if (grid.api.colResizable) {
              grid.api.colResizable.raise.columnSizeChanged(colDef, deltaChange);
            } else {
              gridUtil.logError("The resizeable api is not registered, this may indicate that you've included the module but not added the 'ui-grid-resize-columns' directive to your grid definition.  Cannot raise any events.");
            }
          });
        },
        findTargetCol: function(col, position, rtlMultiplier) {
          var renderContainer = col.getRenderContainer();
          if (position === 'left') {
            var colIndex = renderContainer.visibleColumnCache.indexOf(col);
            return renderContainer.visibleColumnCache[colIndex - 1 * rtlMultiplier];
          } else {
            return col;
          }
        }
      };
      return service;
    }]);
    module.directive('uiGridResizeColumns', ['gridUtil', 'uiGridResizeColumnsService', function(gridUtil, uiGridResizeColumnsService) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        compile: function() {
          return {
            pre: function($scope, $elm, $attrs, uiGridCtrl) {
              uiGridResizeColumnsService.defaultGridOptions(uiGridCtrl.grid.options);
              uiGridCtrl.grid.registerColumnBuilder(uiGridResizeColumnsService.colResizerColumnBuilder);
              uiGridResizeColumnsService.registerPublicApi(uiGridCtrl.grid);
            },
            post: function($scope, $elm, $attrs, uiGridCtrl) {}
          };
        }
      };
    }]);
    module.directive('uiGridHeaderCell', ['gridUtil', '$templateCache', '$compile', '$q', 'uiGridResizeColumnsService', 'uiGridConstants', '$timeout', function(gridUtil, $templateCache, $compile, $q, uiGridResizeColumnsService, uiGridConstants, $timeout) {
      return {
        priority: -10,
        require: '^uiGrid',
        compile: function() {
          return {post: function($scope, $elm, $attrs, uiGridCtrl) {
              var grid = uiGridCtrl.grid;
              if (grid.options.enableColumnResizing) {
                var columnResizerElm = $templateCache.get('ui-grid/columnResizer');
                var rtlMultiplier = 1;
                if (grid.isRTL()) {
                  $scope.position = 'left';
                  rtlMultiplier = -1;
                }
                var displayResizers = function() {
                  var resizers = $elm[0].getElementsByClassName('ui-grid-column-resizer');
                  for (var i = 0; i < resizers.length; i++) {
                    angular.element(resizers[i]).remove();
                  }
                  var otherCol = uiGridResizeColumnsService.findTargetCol($scope.col, 'left', rtlMultiplier);
                  var renderContainer = $scope.col.getRenderContainer();
                  if (otherCol && renderContainer.visibleColumnCache.indexOf($scope.col) !== 0 && otherCol.colDef.enableColumnResizing !== false) {
                    var resizerLeft = angular.element(columnResizerElm).clone();
                    resizerLeft.attr('position', 'left');
                    $elm.prepend(resizerLeft);
                    $compile(resizerLeft)($scope);
                  }
                  if ($scope.col.colDef.enableColumnResizing !== false) {
                    var resizerRight = angular.element(columnResizerElm).clone();
                    resizerRight.attr('position', 'right');
                    $elm.append(resizerRight);
                    $compile(resizerRight)($scope);
                  }
                };
                displayResizers();
                var waitDisplay = function() {
                  $timeout(displayResizers);
                };
                var dataChangeDereg = grid.registerDataChangeCallback(waitDisplay, [uiGridConstants.dataChange.COLUMN]);
                $scope.$on('$destroy', dataChangeDereg);
              }
            }};
        }
      };
    }]);
    module.directive('uiGridColumnResizer', ['$document', 'gridUtil', 'uiGridConstants', 'uiGridResizeColumnsService', function($document, gridUtil, uiGridConstants, uiGridResizeColumnsService) {
      var resizeOverlay = angular.element('<div class="ui-grid-resize-overlay"></div>');
      var resizer = {
        priority: 0,
        scope: {
          col: '=',
          position: '@',
          renderIndex: '='
        },
        require: '?^uiGrid',
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          var startX = 0,
              x = 0,
              gridLeft = 0,
              rtlMultiplier = 1;
          if (uiGridCtrl.grid.isRTL()) {
            $scope.position = 'left';
            rtlMultiplier = -1;
          }
          if ($scope.position === 'left') {
            $elm.addClass('left');
          } else if ($scope.position === 'right') {
            $elm.addClass('right');
          }
          function refreshCanvas(xDiff) {
            uiGridCtrl.grid.refreshCanvas(true).then(function() {
              uiGridCtrl.grid.queueGridRefresh();
            });
          }
          function constrainWidth(col, width) {
            var newWidth = width;
            if (col.minWidth && newWidth < col.minWidth) {
              newWidth = col.minWidth;
            } else if (col.maxWidth && newWidth > col.maxWidth) {
              newWidth = col.maxWidth;
            }
            return newWidth;
          }
          function moveFunction(event, args) {
            if (event.originalEvent) {
              event = event.originalEvent;
            }
            event.preventDefault();
            x = (event.targetTouches ? event.targetTouches[0] : event).clientX - gridLeft;
            if (x < 0) {
              x = 0;
            } else if (x > uiGridCtrl.grid.gridWidth) {
              x = uiGridCtrl.grid.gridWidth;
            }
            var col = uiGridResizeColumnsService.findTargetCol($scope.col, $scope.position, rtlMultiplier);
            if (col.colDef.enableColumnResizing === false) {
              return;
            }
            if (!uiGridCtrl.grid.element.hasClass('column-resizing')) {
              uiGridCtrl.grid.element.addClass('column-resizing');
            }
            var xDiff = x - startX;
            var newWidth = parseInt(col.drawnWidth + xDiff * rtlMultiplier, 10);
            x = x + (constrainWidth(col, newWidth) - newWidth) * rtlMultiplier;
            resizeOverlay.css({left: x + 'px'});
            uiGridCtrl.fireEvent(uiGridConstants.events.ITEM_DRAGGING);
          }
          function upFunction(event, args) {
            if (event.originalEvent) {
              event = event.originalEvent;
            }
            event.preventDefault();
            uiGridCtrl.grid.element.removeClass('column-resizing');
            resizeOverlay.remove();
            x = (event.changedTouches ? event.changedTouches[0] : event).clientX - gridLeft;
            var xDiff = x - startX;
            if (xDiff === 0) {
              offAllEvents();
              onDownEvents();
              return;
            }
            var col = uiGridResizeColumnsService.findTargetCol($scope.col, $scope.position, rtlMultiplier);
            if (col.colDef.enableColumnResizing === false) {
              return;
            }
            var newWidth = parseInt(col.drawnWidth + xDiff * rtlMultiplier, 10);
            col.width = constrainWidth(col, newWidth);
            col.hasCustomWidth = true;
            refreshCanvas(xDiff);
            uiGridResizeColumnsService.fireColumnSizeChanged(uiGridCtrl.grid, col.colDef, xDiff);
            offAllEvents();
            onDownEvents();
          }
          var downFunction = function(event, args) {
            if (event.originalEvent) {
              event = event.originalEvent;
            }
            event.stopPropagation();
            gridLeft = uiGridCtrl.grid.element[0].getBoundingClientRect().left;
            startX = (event.targetTouches ? event.targetTouches[0] : event).clientX - gridLeft;
            uiGridCtrl.grid.element.append(resizeOverlay);
            resizeOverlay.css({left: startX});
            if (event.type === 'touchstart') {
              $document.on('touchend', upFunction);
              $document.on('touchmove', moveFunction);
              $elm.off('mousedown', downFunction);
            } else {
              $document.on('mouseup', upFunction);
              $document.on('mousemove', moveFunction);
              $elm.off('touchstart', downFunction);
            }
          };
          var onDownEvents = function() {
            $elm.on('mousedown', downFunction);
            $elm.on('touchstart', downFunction);
          };
          var offAllEvents = function() {
            $document.off('mouseup', upFunction);
            $document.off('touchend', upFunction);
            $document.off('mousemove', moveFunction);
            $document.off('touchmove', moveFunction);
            $elm.off('mousedown', downFunction);
            $elm.off('touchstart', downFunction);
          };
          onDownEvents();
          var dblClickFn = function(event, args) {
            event.stopPropagation();
            var col = uiGridResizeColumnsService.findTargetCol($scope.col, $scope.position, rtlMultiplier);
            if (col.colDef.enableColumnResizing === false) {
              return;
            }
            var maxWidth = 0;
            var xDiff = 0;
            var renderContainerElm = gridUtil.closestElm($elm, '.ui-grid-render-container');
            var cells = renderContainerElm.querySelectorAll('.' + uiGridConstants.COL_CLASS_PREFIX + col.uid + ' .ui-grid-cell-contents');
            Array.prototype.forEach.call(cells, function(cell) {
              var menuButton;
              if (angular.element(cell).parent().hasClass('ui-grid-header-cell')) {
                menuButton = angular.element(cell).parent()[0].querySelectorAll('.ui-grid-column-menu-button');
              }
              gridUtil.fakeElement(cell, {}, function(newElm) {
                var e = angular.element(newElm);
                e.attr('style', 'float: left');
                var width = gridUtil.elementWidth(e);
                if (menuButton) {
                  var menuButtonWidth = gridUtil.elementWidth(menuButton);
                  width = width + menuButtonWidth;
                }
                if (width > maxWidth) {
                  maxWidth = width;
                  xDiff = maxWidth - width;
                }
              });
            });
            col.width = constrainWidth(col, maxWidth);
            col.hasCustomWidth = true;
            refreshCanvas(xDiff);
            uiGridResizeColumnsService.fireColumnSizeChanged(uiGridCtrl.grid, col.colDef, xDiff);
          };
          $elm.on('dblclick', dblClickFn);
          $elm.on('$destroy', function() {
            $elm.off('dblclick', dblClickFn);
            offAllEvents();
          });
        }
      };
      return resizer;
    }]);
  })();
  (function() {
    'use strict';
    var module = angular.module('ui.grid.rowEdit', ['ui.grid', 'ui.grid.edit', 'ui.grid.cellNav']);
    module.constant('uiGridRowEditConstants', {});
    module.service('uiGridRowEditService', ['$interval', '$q', 'uiGridConstants', 'uiGridRowEditConstants', 'gridUtil', function($interval, $q, uiGridConstants, uiGridRowEditConstants, gridUtil) {
      var service = {
        initializeGrid: function(scope, grid) {
          grid.rowEdit = {};
          var publicApi = {
            events: {rowEdit: {saveRow: function(rowEntity) {}}},
            methods: {rowEdit: {
                setSavePromise: function(rowEntity, savePromise) {
                  service.setSavePromise(grid, rowEntity, savePromise);
                },
                getDirtyRows: function() {
                  return grid.rowEdit.dirtyRows ? grid.rowEdit.dirtyRows : [];
                },
                getErrorRows: function() {
                  return grid.rowEdit.errorRows ? grid.rowEdit.errorRows : [];
                },
                flushDirtyRows: function() {
                  return service.flushDirtyRows(grid);
                },
                setRowsDirty: function(dataRows) {
                  service.setRowsDirty(grid, dataRows);
                },
                setRowsClean: function(dataRows) {
                  service.setRowsClean(grid, dataRows);
                }
              }}
          };
          grid.api.registerEventsFromObject(publicApi.events);
          grid.api.registerMethodsFromObject(publicApi.methods);
          grid.api.core.on.renderingComplete(scope, function(gridApi) {
            grid.api.edit.on.afterCellEdit(scope, service.endEditCell);
            grid.api.edit.on.beginCellEdit(scope, service.beginEditCell);
            grid.api.edit.on.cancelCellEdit(scope, service.cancelEditCell);
            if (grid.api.cellNav) {
              grid.api.cellNav.on.navigate(scope, service.navigate);
            }
          });
        },
        defaultGridOptions: function(gridOptions) {},
        saveRow: function(grid, gridRow) {
          var self = this;
          return function() {
            gridRow.isSaving = true;
            if (gridRow.rowEditSavePromise) {
              return gridRow.rowEditSavePromise;
            }
            var promise = grid.api.rowEdit.raise.saveRow(gridRow.entity);
            if (gridRow.rowEditSavePromise) {
              gridRow.rowEditSavePromise.then(self.processSuccessPromise(grid, gridRow), self.processErrorPromise(grid, gridRow));
            } else {
              gridUtil.logError('A promise was not returned when saveRow event was raised, either nobody is listening to event, or event handler did not return a promise');
            }
            return promise;
          };
        },
        setSavePromise: function(grid, rowEntity, savePromise) {
          var gridRow = grid.getRow(rowEntity);
          gridRow.rowEditSavePromise = savePromise;
        },
        processSuccessPromise: function(grid, gridRow) {
          var self = this;
          return function() {
            delete gridRow.isSaving;
            delete gridRow.isDirty;
            delete gridRow.isError;
            delete gridRow.rowEditSaveTimer;
            delete gridRow.rowEditSavePromise;
            self.removeRow(grid.rowEdit.errorRows, gridRow);
            self.removeRow(grid.rowEdit.dirtyRows, gridRow);
          };
        },
        processErrorPromise: function(grid, gridRow) {
          return function() {
            delete gridRow.isSaving;
            delete gridRow.rowEditSaveTimer;
            delete gridRow.rowEditSavePromise;
            gridRow.isError = true;
            if (!grid.rowEdit.errorRows) {
              grid.rowEdit.errorRows = [];
            }
            if (!service.isRowPresent(grid.rowEdit.errorRows, gridRow)) {
              grid.rowEdit.errorRows.push(gridRow);
            }
          };
        },
        removeRow: function(rowArray, removeGridRow) {
          if (typeof(rowArray) === 'undefined' || rowArray === null) {
            return;
          }
          rowArray.forEach(function(gridRow, index) {
            if (gridRow.uid === removeGridRow.uid) {
              rowArray.splice(index, 1);
            }
          });
        },
        isRowPresent: function(rowArray, removeGridRow) {
          var present = false;
          rowArray.forEach(function(gridRow, index) {
            if (gridRow.uid === removeGridRow.uid) {
              present = true;
            }
          });
          return present;
        },
        flushDirtyRows: function(grid) {
          var promises = [];
          grid.api.rowEdit.getDirtyRows().forEach(function(gridRow) {
            service.saveRow(grid, gridRow)();
            promises.push(gridRow.rowEditSavePromise);
          });
          return $q.all(promises);
        },
        endEditCell: function(rowEntity, colDef, newValue, previousValue) {
          var grid = this.grid;
          var gridRow = grid.getRow(rowEntity);
          if (!gridRow) {
            gridUtil.logError('Unable to find rowEntity in grid data, dirty flag cannot be set');
            return;
          }
          if (newValue !== previousValue || gridRow.isDirty) {
            if (!grid.rowEdit.dirtyRows) {
              grid.rowEdit.dirtyRows = [];
            }
            if (!gridRow.isDirty) {
              gridRow.isDirty = true;
              grid.rowEdit.dirtyRows.push(gridRow);
            }
            delete gridRow.isError;
            service.considerSetTimer(grid, gridRow);
          }
        },
        beginEditCell: function(rowEntity, colDef) {
          var grid = this.grid;
          var gridRow = grid.getRow(rowEntity);
          if (!gridRow) {
            gridUtil.logError('Unable to find rowEntity in grid data, timer cannot be cancelled');
            return;
          }
          service.cancelTimer(grid, gridRow);
        },
        cancelEditCell: function(rowEntity, colDef) {
          var grid = this.grid;
          var gridRow = grid.getRow(rowEntity);
          if (!gridRow) {
            gridUtil.logError('Unable to find rowEntity in grid data, timer cannot be set');
            return;
          }
          service.considerSetTimer(grid, gridRow);
        },
        navigate: function(newRowCol, oldRowCol) {
          var grid = this.grid;
          if (newRowCol.row.rowEditSaveTimer) {
            service.cancelTimer(grid, newRowCol.row);
          }
          if (oldRowCol && oldRowCol.row && oldRowCol.row !== newRowCol.row) {
            service.considerSetTimer(grid, oldRowCol.row);
          }
        },
        considerSetTimer: function(grid, gridRow) {
          service.cancelTimer(grid, gridRow);
          if (gridRow.isDirty && !gridRow.isSaving) {
            if (grid.options.rowEditWaitInterval !== -1) {
              var waitTime = grid.options.rowEditWaitInterval ? grid.options.rowEditWaitInterval : 2000;
              gridRow.rowEditSaveTimer = $interval(service.saveRow(grid, gridRow), waitTime, 1);
            }
          }
        },
        cancelTimer: function(grid, gridRow) {
          if (gridRow.rowEditSaveTimer && !gridRow.isSaving) {
            $interval.cancel(gridRow.rowEditSaveTimer);
            delete gridRow.rowEditSaveTimer;
          }
        },
        setRowsDirty: function(grid, myDataRows) {
          var gridRow;
          myDataRows.forEach(function(value, index) {
            gridRow = grid.getRow(value);
            if (gridRow) {
              if (!grid.rowEdit.dirtyRows) {
                grid.rowEdit.dirtyRows = [];
              }
              if (!gridRow.isDirty) {
                gridRow.isDirty = true;
                grid.rowEdit.dirtyRows.push(gridRow);
              }
              delete gridRow.isError;
              service.considerSetTimer(grid, gridRow);
            } else {
              gridUtil.logError("requested row not found in rowEdit.setRowsDirty, row was: " + value);
            }
          });
        },
        setRowsClean: function(grid, myDataRows) {
          var gridRow;
          myDataRows.forEach(function(value, index) {
            gridRow = grid.getRow(value);
            if (gridRow) {
              delete gridRow.isDirty;
              service.removeRow(grid.rowEdit.dirtyRows, gridRow);
              service.cancelTimer(grid, gridRow);
              delete gridRow.isError;
              service.removeRow(grid.rowEdit.errorRows, gridRow);
            } else {
              gridUtil.logError("requested row not found in rowEdit.setRowsClean, row was: " + value);
            }
          });
        }
      };
      return service;
    }]);
    module.directive('uiGridRowEdit', ['gridUtil', 'uiGridRowEditService', 'uiGridEditConstants', function(gridUtil, uiGridRowEditService, uiGridEditConstants) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        compile: function() {
          return {
            pre: function($scope, $elm, $attrs, uiGridCtrl) {
              uiGridRowEditService.initializeGrid($scope, uiGridCtrl.grid);
            },
            post: function($scope, $elm, $attrs, uiGridCtrl) {}
          };
        }
      };
    }]);
    module.directive('uiGridViewport', ['$compile', 'uiGridConstants', 'gridUtil', '$parse', function($compile, uiGridConstants, gridUtil, $parse) {
      return {
        priority: -200,
        scope: false,
        compile: function($elm, $attrs) {
          var rowRepeatDiv = angular.element($elm.children().children()[0]);
          var existingNgClass = rowRepeatDiv.attr("ng-class");
          var newNgClass = '';
          if (existingNgClass) {
            newNgClass = existingNgClass.slice(0, -1) + ", 'ui-grid-row-dirty': row.isDirty, 'ui-grid-row-saving': row.isSaving, 'ui-grid-row-error': row.isError}";
          } else {
            newNgClass = "{'ui-grid-row-dirty': row.isDirty, 'ui-grid-row-saving': row.isSaving, 'ui-grid-row-error': row.isError}";
          }
          rowRepeatDiv.attr("ng-class", newNgClass);
          return {
            pre: function($scope, $elm, $attrs, controllers) {},
            post: function($scope, $elm, $attrs, controllers) {}
          };
        }
      };
    }]);
  })();
  (function() {
    'use strict';
    var module = angular.module('ui.grid.saveState', ['ui.grid', 'ui.grid.selection', 'ui.grid.cellNav', 'ui.grid.grouping', 'ui.grid.pinning', 'ui.grid.treeView']);
    module.constant('uiGridSaveStateConstants', {featureName: 'saveState'});
    module.service('uiGridSaveStateService', ['$q', 'uiGridSaveStateConstants', 'gridUtil', '$compile', '$interval', 'uiGridConstants', function($q, uiGridSaveStateConstants, gridUtil, $compile, $interval, uiGridConstants) {
      var service = {
        initializeGrid: function(grid) {
          grid.saveState = {};
          this.defaultGridOptions(grid.options);
          var publicApi = {
            events: {saveState: {}},
            methods: {saveState: {
                save: function() {
                  return service.save(grid);
                },
                restore: function($scope, state) {
                  service.restore(grid, $scope, state);
                }
              }}
          };
          grid.api.registerEventsFromObject(publicApi.events);
          grid.api.registerMethodsFromObject(publicApi.methods);
        },
        defaultGridOptions: function(gridOptions) {
          gridOptions.saveWidths = gridOptions.saveWidths !== false;
          gridOptions.saveOrder = gridOptions.saveOrder !== false;
          gridOptions.saveScroll = gridOptions.saveScroll === true;
          gridOptions.saveFocus = gridOptions.saveScroll !== true && gridOptions.saveFocus !== false;
          gridOptions.saveVisible = gridOptions.saveVisible !== false;
          gridOptions.saveSort = gridOptions.saveSort !== false;
          gridOptions.saveFilter = gridOptions.saveFilter !== false;
          gridOptions.saveSelection = gridOptions.saveSelection !== false;
          gridOptions.saveGrouping = gridOptions.saveGrouping !== false;
          gridOptions.saveGroupingExpandedStates = gridOptions.saveGroupingExpandedStates === true;
          gridOptions.savePinning = gridOptions.savePinning !== false;
          gridOptions.saveTreeView = gridOptions.saveTreeView !== false;
        },
        save: function(grid) {
          var savedState = {};
          savedState.columns = service.saveColumns(grid);
          savedState.scrollFocus = service.saveScrollFocus(grid);
          savedState.selection = service.saveSelection(grid);
          savedState.grouping = service.saveGrouping(grid);
          savedState.treeView = service.saveTreeView(grid);
          savedState.pagination = service.savePagination(grid);
          return savedState;
        },
        restore: function(grid, $scope, state) {
          if (state.columns) {
            service.restoreColumns(grid, state.columns);
          }
          if (state.scrollFocus) {
            service.restoreScrollFocus(grid, $scope, state.scrollFocus);
          }
          if (state.selection) {
            service.restoreSelection(grid, state.selection);
          }
          if (state.grouping) {
            service.restoreGrouping(grid, state.grouping);
          }
          if (state.treeView) {
            service.restoreTreeView(grid, state.treeView);
          }
          if (state.pagination) {
            service.restorePagination(grid, state.pagination);
          }
          grid.refresh();
        },
        saveColumns: function(grid) {
          var columns = [];
          grid.getOnlyDataColumns().forEach(function(column) {
            var savedColumn = {};
            savedColumn.name = column.name;
            if (grid.options.saveVisible) {
              savedColumn.visible = column.visible;
            }
            if (grid.options.saveWidths) {
              savedColumn.width = column.width;
            }
            if (grid.options.saveSort) {
              savedColumn.sort = angular.copy(column.sort);
            }
            if (grid.options.saveFilter) {
              savedColumn.filters = [];
              column.filters.forEach(function(filter) {
                var copiedFilter = {};
                angular.forEach(filter, function(value, key) {
                  if (key !== 'condition' && key !== '$$hashKey' && key !== 'placeholder') {
                    copiedFilter[key] = value;
                  }
                });
                savedColumn.filters.push(copiedFilter);
              });
            }
            if (!!grid.api.pinning && grid.options.savePinning) {
              savedColumn.pinned = column.renderContainer ? column.renderContainer : '';
            }
            columns.push(savedColumn);
          });
          return columns;
        },
        saveScrollFocus: function(grid) {
          if (!grid.api.cellNav) {
            return {};
          }
          var scrollFocus = {};
          if (grid.options.saveFocus) {
            scrollFocus.focus = true;
            var rowCol = grid.api.cellNav.getFocusedCell();
            if (rowCol !== null) {
              if (rowCol.col !== null) {
                scrollFocus.colName = rowCol.col.colDef.name;
              }
              if (rowCol.row !== null) {
                scrollFocus.rowVal = service.getRowVal(grid, rowCol.row);
              }
            }
          }
          if (grid.options.saveScroll || grid.options.saveFocus && !scrollFocus.colName && !scrollFocus.rowVal) {
            scrollFocus.focus = false;
            if (grid.renderContainers.body.prevRowScrollIndex) {
              scrollFocus.rowVal = service.getRowVal(grid, grid.renderContainers.body.visibleRowCache[grid.renderContainers.body.prevRowScrollIndex]);
            }
            if (grid.renderContainers.body.prevColScrollIndex) {
              scrollFocus.colName = grid.renderContainers.body.visibleColumnCache[grid.renderContainers.body.prevColScrollIndex].name;
            }
          }
          return scrollFocus;
        },
        saveSelection: function(grid) {
          if (!grid.api.selection || !grid.options.saveSelection) {
            return [];
          }
          var selection = grid.api.selection.getSelectedGridRows().map(function(gridRow) {
            return service.getRowVal(grid, gridRow);
          });
          return selection;
        },
        saveGrouping: function(grid) {
          if (!grid.api.grouping || !grid.options.saveGrouping) {
            return {};
          }
          return grid.api.grouping.getGrouping(grid.options.saveGroupingExpandedStates);
        },
        savePagination: function(grid) {
          if (!grid.api.pagination || !grid.options.paginationPageSize) {
            return {};
          }
          return {
            paginationCurrentPage: grid.options.paginationCurrentPage,
            paginationPageSize: grid.options.paginationPageSize
          };
        },
        saveTreeView: function(grid) {
          if (!grid.api.treeView || !grid.options.saveTreeView) {
            return {};
          }
          return grid.api.treeView.getTreeView();
        },
        getRowVal: function(grid, gridRow) {
          if (!gridRow) {
            return null;
          }
          var rowVal = {};
          if (grid.options.saveRowIdentity) {
            rowVal.identity = true;
            rowVal.row = grid.options.saveRowIdentity(gridRow.entity);
          } else {
            rowVal.identity = false;
            rowVal.row = grid.renderContainers.body.visibleRowCache.indexOf(gridRow);
          }
          return rowVal;
        },
        restoreColumns: function(grid, columnsState) {
          var isSortChanged = false;
          columnsState.forEach(function(columnState, index) {
            var currentCol = grid.getColumn(columnState.name);
            if (currentCol && !grid.isRowHeaderColumn(currentCol)) {
              if (grid.options.saveVisible && (currentCol.visible !== columnState.visible || currentCol.colDef.visible !== columnState.visible)) {
                currentCol.visible = columnState.visible;
                currentCol.colDef.visible = columnState.visible;
                grid.api.core.raise.columnVisibilityChanged(currentCol);
              }
              if (grid.options.saveWidths && currentCol.width !== columnState.width) {
                currentCol.width = columnState.width;
                currentCol.hasCustomWidth = true;
              }
              if (grid.options.saveSort && !angular.equals(currentCol.sort, columnState.sort) && !(currentCol.sort === undefined && angular.isEmpty(columnState.sort))) {
                currentCol.sort = angular.copy(columnState.sort);
                isSortChanged = true;
              }
              if (grid.options.saveFilter && !angular.equals(currentCol.filters, columnState.filters)) {
                columnState.filters.forEach(function(filter, index) {
                  angular.extend(currentCol.filters[index], filter);
                  if (typeof(filter.term) === 'undefined' || filter.term === null) {
                    delete currentCol.filters[index].term;
                  }
                });
                grid.api.core.raise.filterChanged();
              }
              if (!!grid.api.pinning && grid.options.savePinning && currentCol.renderContainer !== columnState.pinned) {
                grid.api.pinning.pinColumn(currentCol, columnState.pinned);
              }
              var currentIndex = grid.getOnlyDataColumns().indexOf(currentCol);
              if (currentIndex !== -1) {
                if (grid.options.saveOrder && currentIndex !== index) {
                  var column = grid.columns.splice(currentIndex + grid.rowHeaderColumns.length, 1)[0];
                  grid.columns.splice(index + grid.rowHeaderColumns.length, 0, column);
                }
              }
            }
          });
          if (isSortChanged) {
            grid.api.core.raise.sortChanged(grid, grid.getColumnSorting());
          }
        },
        restoreScrollFocus: function(grid, $scope, scrollFocusState) {
          if (!grid.api.cellNav) {
            return;
          }
          var colDef,
              row;
          if (scrollFocusState.colName) {
            var colDefs = grid.options.columnDefs.filter(function(colDef) {
              return colDef.name === scrollFocusState.colName;
            });
            if (colDefs.length > 0) {
              colDef = colDefs[0];
            }
          }
          if (scrollFocusState.rowVal && scrollFocusState.rowVal.row) {
            if (scrollFocusState.rowVal.identity) {
              row = service.findRowByIdentity(grid, scrollFocusState.rowVal);
            } else {
              row = grid.renderContainers.body.visibleRowCache[scrollFocusState.rowVal.row];
            }
          }
          var entity = row && row.entity ? row.entity : null;
          if (colDef || entity) {
            if (scrollFocusState.focus) {
              grid.api.cellNav.scrollToFocus(entity, colDef);
            } else {
              grid.scrollTo(entity, colDef);
            }
          }
        },
        restoreSelection: function(grid, selectionState) {
          if (!grid.api.selection) {
            return;
          }
          grid.api.selection.clearSelectedRows();
          selectionState.forEach(function(rowVal) {
            if (rowVal.identity) {
              var foundRow = service.findRowByIdentity(grid, rowVal);
              if (foundRow) {
                grid.api.selection.selectRow(foundRow.entity);
              }
            } else {
              grid.api.selection.selectRowByVisibleIndex(rowVal.row);
            }
          });
        },
        restoreGrouping: function(grid, groupingState) {
          if (!grid.api.grouping || typeof(groupingState) === 'undefined' || groupingState === null || angular.equals(groupingState, {})) {
            return;
          }
          grid.api.grouping.setGrouping(groupingState);
        },
        restoreTreeView: function(grid, treeViewState) {
          if (!grid.api.treeView || typeof(treeViewState) === 'undefined' || treeViewState === null || angular.equals(treeViewState, {})) {
            return;
          }
          grid.api.treeView.setTreeView(treeViewState);
        },
        restorePagination: function(grid, pagination) {
          if (!grid.api.pagination || !grid.options.paginationPageSize) {
            return;
          }
          grid.options.paginationCurrentPage = pagination.paginationCurrentPage;
          grid.options.paginationPageSize = pagination.paginationPageSize;
        },
        findRowByIdentity: function(grid, rowVal) {
          if (!grid.options.saveRowIdentity) {
            return null;
          }
          var filteredRows = grid.rows.filter(function(gridRow) {
            if (grid.options.saveRowIdentity(gridRow.entity) === rowVal.row) {
              return true;
            } else {
              return false;
            }
          });
          if (filteredRows.length > 0) {
            return filteredRows[0];
          } else {
            return null;
          }
        }
      };
      return service;
    }]);
    module.directive('uiGridSaveState', ['uiGridSaveStateConstants', 'uiGridSaveStateService', 'gridUtil', '$compile', function(uiGridSaveStateConstants, uiGridSaveStateService, gridUtil, $compile) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          uiGridSaveStateService.initializeGrid(uiGridCtrl.grid);
        }
      };
    }]);
  })();
  (function() {
    'use strict';
    var module = angular.module('ui.grid.selection', ['ui.grid']);
    module.constant('uiGridSelectionConstants', {
      featureName: "selection",
      selectionRowHeaderColName: 'selectionRowHeaderCol'
    });
    angular.module('ui.grid').config(['$provide', function($provide) {
      $provide.decorator('GridRow', ['$delegate', function($delegate) {
        $delegate.prototype.setSelected = function(selected) {
          this.isSelected = selected;
          if (selected) {
            this.grid.selection.selectedCount++;
          } else {
            this.grid.selection.selectedCount--;
          }
        };
        return $delegate;
      }]);
    }]);
    module.service('uiGridSelectionService', ['$q', '$templateCache', 'uiGridSelectionConstants', 'gridUtil', function($q, $templateCache, uiGridSelectionConstants, gridUtil) {
      var service = {
        initializeGrid: function(grid) {
          grid.selection = {};
          grid.selection.lastSelectedRow = null;
          grid.selection.selectAll = false;
          grid.selection.selectedCount = 0;
          service.defaultGridOptions(grid.options);
          var publicApi = {
            events: {selection: {
                rowSelectionChanged: function(scope, row, evt) {},
                rowSelectionChangedBatch: function(scope, rows, evt) {}
              }},
            methods: {selection: {
                toggleRowSelection: function(rowEntity, evt) {
                  var row = grid.getRow(rowEntity);
                  if (row !== null) {
                    service.toggleRowSelection(grid, row, evt, grid.options.multiSelect, grid.options.noUnselect);
                  }
                },
                selectRow: function(rowEntity, evt) {
                  var row = grid.getRow(rowEntity);
                  if (row !== null && !row.isSelected) {
                    service.toggleRowSelection(grid, row, evt, grid.options.multiSelect, grid.options.noUnselect);
                  }
                },
                selectRowByVisibleIndex: function(rowNum, evt) {
                  var row = grid.renderContainers.body.visibleRowCache[rowNum];
                  if (row !== null && typeof(row) !== 'undefined' && !row.isSelected) {
                    service.toggleRowSelection(grid, row, evt, grid.options.multiSelect, grid.options.noUnselect);
                  }
                },
                unSelectRow: function(rowEntity, evt) {
                  var row = grid.getRow(rowEntity);
                  if (row !== null && row.isSelected) {
                    service.toggleRowSelection(grid, row, evt, grid.options.multiSelect, grid.options.noUnselect);
                  }
                },
                selectAllRows: function(evt) {
                  if (grid.options.multiSelect === false) {
                    return;
                  }
                  var changedRows = [];
                  grid.rows.forEach(function(row) {
                    if (!row.isSelected && row.enableSelection !== false) {
                      row.setSelected(true);
                      service.decideRaiseSelectionEvent(grid, row, changedRows, evt);
                    }
                  });
                  service.decideRaiseSelectionBatchEvent(grid, changedRows, evt);
                  grid.selection.selectAll = true;
                },
                selectAllVisibleRows: function(evt) {
                  if (grid.options.multiSelect === false) {
                    return;
                  }
                  var changedRows = [];
                  grid.rows.forEach(function(row) {
                    if (row.visible) {
                      if (!row.isSelected && row.enableSelection !== false) {
                        row.setSelected(true);
                        service.decideRaiseSelectionEvent(grid, row, changedRows, evt);
                      }
                    } else {
                      if (row.isSelected) {
                        row.setSelected(false);
                        service.decideRaiseSelectionEvent(grid, row, changedRows, evt);
                      }
                    }
                  });
                  service.decideRaiseSelectionBatchEvent(grid, changedRows, evt);
                  grid.selection.selectAll = true;
                },
                clearSelectedRows: function(evt) {
                  service.clearSelectedRows(grid, evt);
                },
                getSelectedRows: function() {
                  return service.getSelectedRows(grid).map(function(gridRow) {
                    return gridRow.entity;
                  });
                },
                getSelectedGridRows: function() {
                  return service.getSelectedRows(grid);
                },
                getSelectedCount: function() {
                  return grid.selection.selectedCount;
                },
                setMultiSelect: function(multiSelect) {
                  grid.options.multiSelect = multiSelect;
                },
                setModifierKeysToMultiSelect: function(modifierKeysToMultiSelect) {
                  grid.options.modifierKeysToMultiSelect = modifierKeysToMultiSelect;
                },
                getSelectAllState: function() {
                  return grid.selection.selectAll;
                }
              }}
          };
          grid.api.registerEventsFromObject(publicApi.events);
          grid.api.registerMethodsFromObject(publicApi.methods);
        },
        defaultGridOptions: function(gridOptions) {
          gridOptions.enableRowSelection = gridOptions.enableRowSelection !== false;
          gridOptions.multiSelect = gridOptions.multiSelect !== false;
          gridOptions.noUnselect = gridOptions.noUnselect === true;
          gridOptions.modifierKeysToMultiSelect = gridOptions.modifierKeysToMultiSelect === true;
          gridOptions.enableRowHeaderSelection = gridOptions.enableRowHeaderSelection !== false;
          if (typeof(gridOptions.enableFullRowSelection) === 'undefined') {
            gridOptions.enableFullRowSelection = !gridOptions.enableRowHeaderSelection;
          }
          gridOptions.enableSelectAll = gridOptions.enableSelectAll !== false;
          gridOptions.enableSelectionBatchEvent = gridOptions.enableSelectionBatchEvent !== false;
          gridOptions.selectionRowHeaderWidth = angular.isDefined(gridOptions.selectionRowHeaderWidth) ? gridOptions.selectionRowHeaderWidth : 30;
          gridOptions.enableFooterTotalSelected = gridOptions.enableFooterTotalSelected !== false;
          gridOptions.isRowSelectable = angular.isDefined(gridOptions.isRowSelectable) ? gridOptions.isRowSelectable : angular.noop;
        },
        toggleRowSelection: function(grid, row, evt, multiSelect, noUnselect) {
          var selected = row.isSelected;
          if (row.enableSelection === false && !selected) {
            return;
          }
          var selectedRows;
          if (!multiSelect && !selected) {
            service.clearSelectedRows(grid, evt);
          } else if (!multiSelect && selected) {
            selectedRows = service.getSelectedRows(grid);
            if (selectedRows.length > 1) {
              selected = false;
              service.clearSelectedRows(grid, evt);
            }
          }
          if (selected && noUnselect) {} else {
            row.setSelected(!selected);
            if (row.isSelected === true) {
              grid.selection.lastSelectedRow = row;
            }
            selectedRows = service.getSelectedRows(grid);
            grid.selection.selectAll = grid.rows.length === selectedRows.length;
            grid.api.selection.raise.rowSelectionChanged(row, evt);
          }
        },
        shiftSelect: function(grid, row, evt, multiSelect) {
          if (!multiSelect) {
            return;
          }
          var selectedRows = service.getSelectedRows(grid);
          var fromRow = selectedRows.length > 0 ? grid.renderContainers.body.visibleRowCache.indexOf(grid.selection.lastSelectedRow) : 0;
          var toRow = grid.renderContainers.body.visibleRowCache.indexOf(row);
          if (fromRow > toRow) {
            var tmp = fromRow;
            fromRow = toRow;
            toRow = tmp;
          }
          var changedRows = [];
          for (var i = fromRow; i <= toRow; i++) {
            var rowToSelect = grid.renderContainers.body.visibleRowCache[i];
            if (rowToSelect) {
              if (!rowToSelect.isSelected && rowToSelect.enableSelection !== false) {
                rowToSelect.setSelected(true);
                grid.selection.lastSelectedRow = rowToSelect;
                service.decideRaiseSelectionEvent(grid, rowToSelect, changedRows, evt);
              }
            }
          }
          service.decideRaiseSelectionBatchEvent(grid, changedRows, evt);
        },
        getSelectedRows: function(grid) {
          return grid.rows.filter(function(row) {
            return row.isSelected;
          });
        },
        clearSelectedRows: function(grid, evt) {
          var changedRows = [];
          service.getSelectedRows(grid).forEach(function(row) {
            if (row.isSelected) {
              row.setSelected(false);
              service.decideRaiseSelectionEvent(grid, row, changedRows, evt);
            }
          });
          service.decideRaiseSelectionBatchEvent(grid, changedRows, evt);
          grid.selection.selectAll = false;
          grid.selection.selectedCount = 0;
        },
        decideRaiseSelectionEvent: function(grid, row, changedRows, evt) {
          if (!grid.options.enableSelectionBatchEvent) {
            grid.api.selection.raise.rowSelectionChanged(row, evt);
          } else {
            changedRows.push(row);
          }
        },
        decideRaiseSelectionBatchEvent: function(grid, changedRows, evt) {
          if (changedRows.length > 0) {
            grid.api.selection.raise.rowSelectionChangedBatch(changedRows, evt);
          }
        }
      };
      return service;
    }]);
    module.directive('uiGridSelection', ['uiGridSelectionConstants', 'uiGridSelectionService', '$templateCache', 'uiGridConstants', function(uiGridSelectionConstants, uiGridSelectionService, $templateCache, uiGridConstants) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        compile: function() {
          return {
            pre: function($scope, $elm, $attrs, uiGridCtrl) {
              uiGridSelectionService.initializeGrid(uiGridCtrl.grid);
              if (uiGridCtrl.grid.options.enableRowHeaderSelection) {
                var selectionRowHeaderDef = {
                  name: uiGridSelectionConstants.selectionRowHeaderColName,
                  displayName: '',
                  width: uiGridCtrl.grid.options.selectionRowHeaderWidth,
                  minWidth: 10,
                  cellTemplate: 'ui-grid/selectionRowHeader',
                  headerCellTemplate: 'ui-grid/selectionHeaderCell',
                  enableColumnResizing: false,
                  enableColumnMenu: false,
                  exporterSuppressExport: true,
                  allowCellFocus: true
                };
                uiGridCtrl.grid.addRowHeaderColumn(selectionRowHeaderDef);
              }
              var processorSet = false;
              var processSelectableRows = function(rows) {
                rows.forEach(function(row) {
                  row.enableSelection = uiGridCtrl.grid.options.isRowSelectable(row);
                });
                return rows;
              };
              var updateOptions = function() {
                if (uiGridCtrl.grid.options.isRowSelectable !== angular.noop && processorSet !== true) {
                  uiGridCtrl.grid.registerRowsProcessor(processSelectableRows, 500);
                  processorSet = true;
                }
              };
              updateOptions();
              var dataChangeDereg = uiGridCtrl.grid.registerDataChangeCallback(updateOptions, [uiGridConstants.dataChange.OPTIONS]);
              $scope.$on('$destroy', dataChangeDereg);
            },
            post: function($scope, $elm, $attrs, uiGridCtrl) {}
          };
        }
      };
    }]);
    module.directive('uiGridSelectionRowHeaderButtons', ['$templateCache', 'uiGridSelectionService', 'gridUtil', function($templateCache, uiGridSelectionService, gridUtil) {
      return {
        replace: true,
        restrict: 'E',
        template: $templateCache.get('ui-grid/selectionRowHeaderButtons'),
        scope: true,
        require: '^uiGrid',
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          var self = uiGridCtrl.grid;
          $scope.selectButtonClick = selectButtonClick;
          if (gridUtil.detectBrowser() === 'ie') {
            $elm.on('mousedown', selectButtonMouseDown);
          }
          function selectButtonClick(row, evt) {
            evt.stopPropagation();
            if (evt.shiftKey) {
              uiGridSelectionService.shiftSelect(self, row, evt, self.options.multiSelect);
            } else if (evt.ctrlKey || evt.metaKey) {
              uiGridSelectionService.toggleRowSelection(self, row, evt, self.options.multiSelect, self.options.noUnselect);
            } else {
              uiGridSelectionService.toggleRowSelection(self, row, evt, (self.options.multiSelect && !self.options.modifierKeysToMultiSelect), self.options.noUnselect);
            }
          }
          function selectButtonMouseDown(evt) {
            if (evt.ctrlKey || evt.shiftKey) {
              evt.target.onselectstart = function() {
                return false;
              };
              window.setTimeout(function() {
                evt.target.onselectstart = null;
              }, 0);
            }
          }
        }
      };
    }]);
    module.directive('uiGridSelectionSelectAllButtons', ['$templateCache', 'uiGridSelectionService', function($templateCache, uiGridSelectionService) {
      return {
        replace: true,
        restrict: 'E',
        template: $templateCache.get('ui-grid/selectionSelectAllButtons'),
        scope: false,
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          var self = $scope.col.grid;
          $scope.headerButtonClick = function(row, evt) {
            if (self.selection.selectAll) {
              uiGridSelectionService.clearSelectedRows(self, evt);
              if (self.options.noUnselect) {
                self.api.selection.selectRowByVisibleIndex(0, evt);
              }
              self.selection.selectAll = false;
            } else {
              if (self.options.multiSelect) {
                self.api.selection.selectAllVisibleRows(evt);
                self.selection.selectAll = true;
              }
            }
          };
        }
      };
    }]);
    module.directive('uiGridViewport', ['$compile', 'uiGridConstants', 'uiGridSelectionConstants', 'gridUtil', '$parse', 'uiGridSelectionService', function($compile, uiGridConstants, uiGridSelectionConstants, gridUtil, $parse, uiGridSelectionService) {
      return {
        priority: -200,
        scope: false,
        compile: function($elm, $attrs) {
          var rowRepeatDiv = angular.element($elm.children().children()[0]);
          var existingNgClass = rowRepeatDiv.attr("ng-class");
          var newNgClass = '';
          if (existingNgClass) {
            newNgClass = existingNgClass.slice(0, -1) + ",'ui-grid-row-selected': row.isSelected}";
          } else {
            newNgClass = "{'ui-grid-row-selected': row.isSelected}";
          }
          rowRepeatDiv.attr("ng-class", newNgClass);
          return {
            pre: function($scope, $elm, $attrs, controllers) {},
            post: function($scope, $elm, $attrs, controllers) {}
          };
        }
      };
    }]);
    module.directive('uiGridCell', ['$compile', 'uiGridConstants', 'uiGridSelectionConstants', 'gridUtil', '$parse', 'uiGridSelectionService', '$timeout', function($compile, uiGridConstants, uiGridSelectionConstants, gridUtil, $parse, uiGridSelectionService, $timeout) {
      return {
        priority: -200,
        restrict: 'A',
        require: '?^uiGrid',
        scope: false,
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          var touchStartTime = 0;
          var touchTimeout = 300;
          if (uiGridCtrl.grid.api.cellNav) {
            uiGridCtrl.grid.api.cellNav.on.viewPortKeyDown($scope, function(evt, rowCol) {
              if (rowCol === null || rowCol.row !== $scope.row || rowCol.col !== $scope.col) {
                return;
              }
              if (evt.keyCode === 32 && $scope.col.colDef.name === "selectionRowHeaderCol") {
                uiGridSelectionService.toggleRowSelection($scope.grid, $scope.row, evt, ($scope.grid.options.multiSelect && !$scope.grid.options.modifierKeysToMultiSelect), $scope.grid.options.noUnselect);
                $scope.$apply();
              }
            });
          }
          var selectCells = function(evt) {
            $elm.off('touchend', touchEnd);
            if (evt.shiftKey) {
              uiGridSelectionService.shiftSelect($scope.grid, $scope.row, evt, $scope.grid.options.multiSelect);
            } else if (evt.ctrlKey || evt.metaKey) {
              uiGridSelectionService.toggleRowSelection($scope.grid, $scope.row, evt, $scope.grid.options.multiSelect, $scope.grid.options.noUnselect);
            } else {
              uiGridSelectionService.toggleRowSelection($scope.grid, $scope.row, evt, ($scope.grid.options.multiSelect && !$scope.grid.options.modifierKeysToMultiSelect), $scope.grid.options.noUnselect);
            }
            $scope.$apply();
            $timeout(function() {
              $elm.on('touchend', touchEnd);
            }, touchTimeout);
          };
          var touchStart = function(evt) {
            touchStartTime = (new Date()).getTime();
            $elm.off('click', selectCells);
          };
          var touchEnd = function(evt) {
            var touchEndTime = (new Date()).getTime();
            var touchTime = touchEndTime - touchStartTime;
            if (touchTime < touchTimeout) {
              selectCells(evt);
            }
            $timeout(function() {
              $elm.on('click', selectCells);
            }, touchTimeout);
          };
          function registerRowSelectionEvents() {
            if ($scope.grid.options.enableRowSelection && $scope.grid.options.enableFullRowSelection) {
              $elm.addClass('ui-grid-disable-selection');
              $elm.on('touchstart', touchStart);
              $elm.on('touchend', touchEnd);
              $elm.on('click', selectCells);
              $scope.registered = true;
            }
          }
          function deregisterRowSelectionEvents() {
            if ($scope.registered) {
              $elm.removeClass('ui-grid-disable-selection');
              $elm.off('touchstart', touchStart);
              $elm.off('touchend', touchEnd);
              $elm.off('click', selectCells);
              $scope.registered = false;
            }
          }
          registerRowSelectionEvents();
          var dataChangeDereg = $scope.grid.registerDataChangeCallback(function() {
            if ($scope.grid.options.enableRowSelection && $scope.grid.options.enableFullRowSelection && !$scope.registered) {
              registerRowSelectionEvents();
            } else if ((!$scope.grid.options.enableRowSelection || !$scope.grid.options.enableFullRowSelection) && $scope.registered) {
              deregisterRowSelectionEvents();
            }
          }, [uiGridConstants.dataChange.OPTIONS]);
          $elm.on('$destroy', dataChangeDereg);
        }
      };
    }]);
    module.directive('uiGridGridFooter', ['$compile', 'uiGridConstants', 'gridUtil', function($compile, uiGridConstants, gridUtil) {
      return {
        restrict: 'EA',
        replace: true,
        priority: -1000,
        require: '^uiGrid',
        scope: true,
        compile: function($elm, $attrs) {
          return {
            pre: function($scope, $elm, $attrs, uiGridCtrl) {
              if (!uiGridCtrl.grid.options.showGridFooter) {
                return;
              }
              gridUtil.getTemplate('ui-grid/gridFooterSelectedItems').then(function(contents) {
                var template = angular.element(contents);
                var newElm = $compile(template)($scope);
                angular.element($elm[0].getElementsByClassName('ui-grid-grid-footer')[0]).append(newElm);
              });
            },
            post: function($scope, $elm, $attrs, controllers) {}
          };
        }
      };
    }]);
  })();
  (function() {
    'use strict';
    var module = angular.module('ui.grid.treeBase', ['ui.grid']);
    module.constant('uiGridTreeBaseConstants', {
      featureName: "treeBase",
      rowHeaderColName: 'treeBaseRowHeaderCol',
      EXPANDED: 'expanded',
      COLLAPSED: 'collapsed',
      aggregation: {
        COUNT: 'count',
        SUM: 'sum',
        MAX: 'max',
        MIN: 'min',
        AVG: 'avg'
      }
    });
    module.service('uiGridTreeBaseService', ['$q', 'uiGridTreeBaseConstants', 'gridUtil', 'GridRow', 'gridClassFactory', 'i18nService', 'uiGridConstants', 'rowSorter', function($q, uiGridTreeBaseConstants, gridUtil, GridRow, gridClassFactory, i18nService, uiGridConstants, rowSorter) {
      var service = {
        initializeGrid: function(grid, $scope) {
          grid.treeBase = {};
          grid.treeBase.numberLevels = 0;
          grid.treeBase.expandAll = false;
          grid.treeBase.tree = [];
          service.defaultGridOptions(grid.options);
          grid.registerRowsProcessor(service.treeRows, 410);
          grid.registerColumnBuilder(service.treeBaseColumnBuilder);
          service.createRowHeader(grid);
          var publicApi = {
            events: {treeBase: {
                rowExpanded: {},
                rowCollapsed: {}
              }},
            methods: {treeBase: {
                expandAllRows: function() {
                  service.expandAllRows(grid);
                },
                collapseAllRows: function() {
                  service.collapseAllRows(grid);
                },
                toggleRowTreeState: function(row) {
                  service.toggleRowTreeState(grid, row);
                },
                expandRow: function(row) {
                  service.expandRow(grid, row);
                },
                expandRowChildren: function(row) {
                  service.expandRowChildren(grid, row);
                },
                collapseRow: function(row) {
                  service.collapseRow(grid, row);
                },
                collapseRowChildren: function(row) {
                  service.collapseRowChildren(grid, row);
                },
                getTreeExpandedState: function() {
                  return {expandedState: service.getTreeState(grid)};
                },
                setTreeState: function(config) {
                  service.setTreeState(grid, config);
                },
                getRowChildren: function(row) {
                  return row.treeNode.children.map(function(childNode) {
                    return childNode.row;
                  });
                }
              }}
          };
          grid.api.registerEventsFromObject(publicApi.events);
          grid.api.registerMethodsFromObject(publicApi.methods);
        },
        defaultGridOptions: function(gridOptions) {
          gridOptions.treeRowHeaderBaseWidth = gridOptions.treeRowHeaderBaseWidth || 30;
          gridOptions.treeIndent = gridOptions.treeIndent || 10;
          gridOptions.showTreeRowHeader = gridOptions.showTreeRowHeader !== false;
          gridOptions.showTreeExpandNoChildren = gridOptions.showTreeExpandNoChildren !== false;
          gridOptions.treeRowHeaderAlwaysVisible = gridOptions.treeRowHeaderAlwaysVisible !== false;
          gridOptions.treeCustomAggregations = gridOptions.treeCustomAggregations || {};
          gridOptions.enableExpandAll = gridOptions.enableExpandAll !== false;
        },
        treeBaseColumnBuilder: function(colDef, col, gridOptions) {
          if (typeof(colDef.customTreeAggregationFn) !== 'undefined') {
            col.treeAggregationFn = colDef.customTreeAggregationFn;
          }
          if (typeof(colDef.treeAggregationType) !== 'undefined') {
            col.treeAggregation = {type: colDef.treeAggregationType};
            if (typeof(gridOptions.treeCustomAggregations[colDef.treeAggregationType]) !== 'undefined') {
              col.treeAggregationFn = gridOptions.treeCustomAggregations[colDef.treeAggregationType].aggregationFn;
              col.treeAggregationFinalizerFn = gridOptions.treeCustomAggregations[colDef.treeAggregationType].finalizerFn;
              col.treeAggregation.label = gridOptions.treeCustomAggregations[colDef.treeAggregationType].label;
            } else if (typeof(service.nativeAggregations()[colDef.treeAggregationType]) !== 'undefined') {
              col.treeAggregationFn = service.nativeAggregations()[colDef.treeAggregationType].aggregationFn;
              col.treeAggregation.label = service.nativeAggregations()[colDef.treeAggregationType].label;
            }
          }
          if (typeof(colDef.treeAggregationLabel) !== 'undefined') {
            if (typeof(col.treeAggregation) === 'undefined') {
              col.treeAggregation = {};
            }
            col.treeAggregation.label = colDef.treeAggregationLabel;
          }
          col.treeAggregationUpdateEntity = colDef.treeAggregationUpdateEntity !== false;
          if (typeof(col.customTreeAggregationFinalizerFn) === 'undefined') {
            col.customTreeAggregationFinalizerFn = colDef.customTreeAggregationFinalizerFn;
          }
        },
        createRowHeader: function(grid) {
          var rowHeaderColumnDef = {
            name: uiGridTreeBaseConstants.rowHeaderColName,
            displayName: '',
            width: grid.options.treeRowHeaderBaseWidth,
            minWidth: 10,
            cellTemplate: 'ui-grid/treeBaseRowHeader',
            headerCellTemplate: 'ui-grid/treeBaseHeaderCell',
            enableColumnResizing: false,
            enableColumnMenu: false,
            exporterSuppressExport: true,
            allowCellFocus: true
          };
          rowHeaderColumnDef.visible = grid.options.treeRowHeaderAlwaysVisible;
          grid.addRowHeaderColumn(rowHeaderColumnDef);
        },
        expandAllRows: function(grid) {
          grid.treeBase.tree.forEach(function(node) {
            service.setAllNodes(grid, node, uiGridTreeBaseConstants.EXPANDED);
          });
          grid.treeBase.expandAll = true;
          grid.queueGridRefresh();
        },
        collapseAllRows: function(grid) {
          grid.treeBase.tree.forEach(function(node) {
            service.setAllNodes(grid, node, uiGridTreeBaseConstants.COLLAPSED);
          });
          grid.treeBase.expandAll = false;
          grid.queueGridRefresh();
        },
        setAllNodes: function(grid, treeNode, targetState) {
          if (typeof(treeNode.state) !== 'undefined' && treeNode.state !== targetState) {
            treeNode.state = targetState;
            if (targetState === uiGridTreeBaseConstants.EXPANDED) {
              grid.api.treeBase.raise.rowExpanded(treeNode.row);
            } else {
              grid.api.treeBase.raise.rowCollapsed(treeNode.row);
            }
          }
          if (treeNode.children) {
            treeNode.children.forEach(function(childNode) {
              service.setAllNodes(grid, childNode, targetState);
            });
          }
        },
        toggleRowTreeState: function(grid, row) {
          if (typeof(row.treeLevel) === 'undefined' || row.treeLevel === null || row.treeLevel < 0) {
            return;
          }
          if (row.treeNode.state === uiGridTreeBaseConstants.EXPANDED) {
            service.collapseRow(grid, row);
          } else {
            service.expandRow(grid, row);
          }
          grid.queueGridRefresh();
        },
        expandRow: function(grid, row) {
          if (typeof(row.treeLevel) === 'undefined' || row.treeLevel === null || row.treeLevel < 0) {
            return;
          }
          if (row.treeNode.state !== uiGridTreeBaseConstants.EXPANDED) {
            row.treeNode.state = uiGridTreeBaseConstants.EXPANDED;
            grid.api.treeBase.raise.rowExpanded(row);
            grid.treeBase.expandAll = service.allExpanded(grid.treeBase.tree);
            grid.queueGridRefresh();
          }
        },
        expandRowChildren: function(grid, row) {
          if (typeof(row.treeLevel) === 'undefined' || row.treeLevel === null || row.treeLevel < 0) {
            return;
          }
          service.setAllNodes(grid, row.treeNode, uiGridTreeBaseConstants.EXPANDED);
          grid.treeBase.expandAll = service.allExpanded(grid.treeBase.tree);
          grid.queueGridRefresh();
        },
        collapseRow: function(grid, row) {
          if (typeof(row.treeLevel) === 'undefined' || row.treeLevel === null || row.treeLevel < 0) {
            return;
          }
          if (row.treeNode.state !== uiGridTreeBaseConstants.COLLAPSED) {
            row.treeNode.state = uiGridTreeBaseConstants.COLLAPSED;
            grid.treeBase.expandAll = false;
            grid.api.treeBase.raise.rowCollapsed(row);
            grid.queueGridRefresh();
          }
        },
        collapseRowChildren: function(grid, row) {
          if (typeof(row.treeLevel) === 'undefined' || row.treeLevel === null || row.treeLevel < 0) {
            return;
          }
          service.setAllNodes(grid, row.treeNode, uiGridTreeBaseConstants.COLLAPSED);
          grid.treeBase.expandAll = false;
          grid.queueGridRefresh();
        },
        allExpanded: function(tree) {
          var allExpanded = true;
          tree.forEach(function(node) {
            if (!service.allExpandedInternal(node)) {
              allExpanded = false;
            }
          });
          return allExpanded;
        },
        allExpandedInternal: function(treeNode) {
          if (treeNode.children && treeNode.children.length > 0) {
            if (treeNode.state === uiGridTreeBaseConstants.COLLAPSED) {
              return false;
            }
            var allExpanded = true;
            treeNode.children.forEach(function(node) {
              if (!service.allExpandedInternal(node)) {
                allExpanded = false;
              }
            });
            return allExpanded;
          } else {
            return true;
          }
        },
        treeRows: function(renderableRows) {
          if (renderableRows.length === 0) {
            return renderableRows;
          }
          var grid = this;
          var currentLevel = 0;
          var currentState = uiGridTreeBaseConstants.EXPANDED;
          var parents = [];
          grid.treeBase.tree = service.createTree(grid, renderableRows);
          service.updateRowHeaderWidth(grid);
          service.sortTree(grid);
          service.fixFilter(grid);
          return service.renderTree(grid.treeBase.tree);
        },
        updateRowHeaderWidth: function(grid) {
          var rowHeader = grid.getColumn(uiGridTreeBaseConstants.rowHeaderColName);
          var newWidth = grid.options.treeRowHeaderBaseWidth + grid.options.treeIndent * Math.max(grid.treeBase.numberLevels - 1, 0);
          if (rowHeader && newWidth !== rowHeader.width) {
            rowHeader.width = newWidth;
            grid.queueRefresh();
          }
          var newVisibility = true;
          if (grid.options.showTreeRowHeader === false) {
            newVisibility = false;
          }
          if (grid.options.treeRowHeaderAlwaysVisible === false && grid.treeBase.numberLevels <= 0) {
            newVisibility = false;
          }
          if (rowHeader.visible !== newVisibility) {
            rowHeader.visible = newVisibility;
            rowHeader.colDef.visible = newVisibility;
            grid.queueGridRefresh();
          }
        },
        renderTree: function(nodeList) {
          var renderableRows = [];
          nodeList.forEach(function(node) {
            if (node.row.visible) {
              renderableRows.push(node.row);
            }
            if (node.state === uiGridTreeBaseConstants.EXPANDED && node.children && node.children.length > 0) {
              renderableRows = renderableRows.concat(service.renderTree(node.children));
            }
          });
          return renderableRows;
        },
        createTree: function(grid, renderableRows) {
          var currentLevel = -1;
          var parents = [];
          var currentState;
          grid.treeBase.tree = [];
          grid.treeBase.numberLevels = 0;
          var aggregations = service.getAggregations(grid);
          var createNode = function(row) {
            if (typeof(row.entity.$$treeLevel) !== 'undefined' && row.treeLevel !== row.entity.$$treeLevel) {
              row.treeLevel = row.entity.$$treeLevel;
            }
            if (row.treeLevel <= currentLevel) {
              while (row.treeLevel <= currentLevel) {
                var lastParent = parents.pop();
                service.finaliseAggregations(lastParent);
                currentLevel--;
              }
              if (parents.length > 0) {
                currentState = service.setCurrentState(parents);
              } else {
                currentState = uiGridTreeBaseConstants.EXPANDED;
              }
            }
            if ((typeof(row.treeLevel) === 'undefined' || row.treeLevel === null || row.treeLevel < 0) && row.visible) {
              service.aggregate(grid, row, parents);
            }
            service.addOrUseNode(grid, row, parents, aggregations);
            if (typeof(row.treeLevel) !== 'undefined' && row.treeLevel !== null && row.treeLevel >= 0) {
              parents.push(row);
              currentLevel++;
              currentState = service.setCurrentState(parents);
            }
            if (grid.treeBase.numberLevels < row.treeLevel + 1) {
              grid.treeBase.numberLevels = row.treeLevel + 1;
            }
          };
          renderableRows.forEach(createNode);
          while (parents.length > 0) {
            var lastParent = parents.pop();
            service.finaliseAggregations(lastParent);
          }
          return grid.treeBase.tree;
        },
        addOrUseNode: function(grid, row, parents, aggregationBase) {
          var newAggregations = [];
          aggregationBase.forEach(function(aggregation) {
            newAggregations.push(service.buildAggregationObject(aggregation.col));
          });
          var newNode = {
            state: uiGridTreeBaseConstants.COLLAPSED,
            row: row,
            parentRow: null,
            aggregations: newAggregations,
            children: []
          };
          if (row.treeNode) {
            newNode.state = row.treeNode.state;
          }
          if (parents.length > 0) {
            newNode.parentRow = parents[parents.length - 1];
          }
          row.treeNode = newNode;
          if (parents.length === 0) {
            grid.treeBase.tree.push(newNode);
          } else {
            parents[parents.length - 1].treeNode.children.push(newNode);
          }
        },
        setCurrentState: function(parents) {
          var currentState = uiGridTreeBaseConstants.EXPANDED;
          parents.forEach(function(parent) {
            if (parent.treeNode.state === uiGridTreeBaseConstants.COLLAPSED) {
              currentState = uiGridTreeBaseConstants.COLLAPSED;
            }
          });
          return currentState;
        },
        sortTree: function(grid) {
          grid.columns.forEach(function(column) {
            if (column.sort && column.sort.ignoreSort) {
              delete column.sort.ignoreSort;
            }
          });
          grid.treeBase.tree = service.sortInternal(grid, grid.treeBase.tree);
        },
        sortInternal: function(grid, treeList) {
          var rows = treeList.map(function(node) {
            return node.row;
          });
          rows = rowSorter.sort(grid, rows, grid.columns);
          var treeNodes = rows.map(function(row) {
            return row.treeNode;
          });
          treeNodes.forEach(function(node) {
            if (node.state === uiGridTreeBaseConstants.EXPANDED && node.children && node.children.length > 0) {
              node.children = service.sortInternal(grid, node.children);
            }
          });
          return treeNodes;
        },
        fixFilter: function(grid) {
          var parentsVisible;
          grid.treeBase.tree.forEach(function(node) {
            if (node.children && node.children.length > 0) {
              parentsVisible = node.row.visible;
              service.fixFilterInternal(node.children, parentsVisible);
            }
          });
        },
        fixFilterInternal: function(nodes, parentsVisible) {
          nodes.forEach(function(node) {
            if (node.row.visible && !parentsVisible) {
              service.setParentsVisible(node);
              parentsVisible = true;
            }
            if (node.children && node.children.length > 0) {
              if (service.fixFilterInternal(node.children, (parentsVisible && node.row.visible))) {
                parentsVisible = true;
              }
            }
          });
          return parentsVisible;
        },
        setParentsVisible: function(node) {
          while (node.parentRow) {
            node.parentRow.visible = true;
            node = node.parentRow.treeNode;
          }
        },
        buildAggregationObject: function(column) {
          var newAggregation = {col: column};
          if (column.treeAggregation && column.treeAggregation.type) {
            newAggregation.type = column.treeAggregation.type;
          }
          if (column.treeAggregation && column.treeAggregation.label) {
            newAggregation.label = column.treeAggregation.label;
          }
          return newAggregation;
        },
        getAggregations: function(grid) {
          var aggregateArray = [];
          grid.columns.forEach(function(column) {
            if (typeof(column.treeAggregationFn) !== 'undefined') {
              aggregateArray.push(service.buildAggregationObject(column));
              if (grid.options.showColumnFooter && typeof(column.colDef.aggregationType) === 'undefined' && column.treeAggregation) {
                column.treeFooterAggregation = service.buildAggregationObject(column);
                column.aggregationType = service.treeFooterAggregationType;
              }
            }
          });
          return aggregateArray;
        },
        aggregate: function(grid, row, parents) {
          if (parents.length === 0 && row.treeNode && row.treeNode.aggregations) {
            row.treeNode.aggregations.forEach(function(aggregation) {
              if (typeof(aggregation.col.treeFooterAggregation) !== 'undefined') {
                var fieldValue = grid.getCellValue(row, aggregation.col);
                var numValue = Number(fieldValue);
                aggregation.col.treeAggregationFn(aggregation.col.treeFooterAggregation, fieldValue, numValue, row);
              }
            });
          }
          parents.forEach(function(parent, index) {
            if (parent.treeNode.aggregations) {
              parent.treeNode.aggregations.forEach(function(aggregation) {
                var fieldValue = grid.getCellValue(row, aggregation.col);
                var numValue = Number(fieldValue);
                aggregation.col.treeAggregationFn(aggregation, fieldValue, numValue, row);
                if (index === 0 && typeof(aggregation.col.treeFooterAggregation) !== 'undefined') {
                  aggregation.col.treeAggregationFn(aggregation.col.treeFooterAggregation, fieldValue, numValue, row);
                }
              });
            }
          });
        },
        nativeAggregations: function() {
          var nativeAggregations = {
            count: {
              label: i18nService.get().aggregation.count,
              menuTitle: i18nService.get().grouping.aggregate_count,
              aggregationFn: function(aggregation, fieldValue, numValue) {
                if (typeof(aggregation.value) === 'undefined') {
                  aggregation.value = 1;
                } else {
                  aggregation.value++;
                }
              }
            },
            sum: {
              label: i18nService.get().aggregation.sum,
              menuTitle: i18nService.get().grouping.aggregate_sum,
              aggregationFn: function(aggregation, fieldValue, numValue) {
                if (!isNaN(numValue)) {
                  if (typeof(aggregation.value) === 'undefined') {
                    aggregation.value = numValue;
                  } else {
                    aggregation.value += numValue;
                  }
                }
              }
            },
            min: {
              label: i18nService.get().aggregation.min,
              menuTitle: i18nService.get().grouping.aggregate_min,
              aggregationFn: function(aggregation, fieldValue, numValue) {
                if (typeof(aggregation.value) === 'undefined') {
                  aggregation.value = fieldValue;
                } else {
                  if (typeof(fieldValue) !== 'undefined' && fieldValue !== null && (fieldValue < aggregation.value || aggregation.value === null)) {
                    aggregation.value = fieldValue;
                  }
                }
              }
            },
            max: {
              label: i18nService.get().aggregation.max,
              menuTitle: i18nService.get().grouping.aggregate_max,
              aggregationFn: function(aggregation, fieldValue, numValue) {
                if (typeof(aggregation.value) === 'undefined') {
                  aggregation.value = fieldValue;
                } else {
                  if (typeof(fieldValue) !== 'undefined' && fieldValue !== null && (fieldValue > aggregation.value || aggregation.value === null)) {
                    aggregation.value = fieldValue;
                  }
                }
              }
            },
            avg: {
              label: i18nService.get().aggregation.avg,
              menuTitle: i18nService.get().grouping.aggregate_avg,
              aggregationFn: function(aggregation, fieldValue, numValue) {
                if (typeof(aggregation.count) === 'undefined') {
                  aggregation.count = 1;
                } else {
                  aggregation.count++;
                }
                if (isNaN(numValue)) {
                  return;
                }
                if (typeof(aggregation.value) === 'undefined' || typeof(aggregation.sum) === 'undefined') {
                  aggregation.value = numValue;
                  aggregation.sum = numValue;
                } else {
                  aggregation.sum += numValue;
                  aggregation.value = aggregation.sum / aggregation.count;
                }
              }
            }
          };
          return nativeAggregations;
        },
        finaliseAggregation: function(row, aggregation) {
          if (aggregation.col.treeAggregationUpdateEntity && typeof(row) !== 'undefined' && typeof(row.entity['$$' + aggregation.col.uid]) !== 'undefined') {
            angular.extend(aggregation, row.entity['$$' + aggregation.col.uid]);
          }
          if (typeof(aggregation.col.treeAggregationFinalizerFn) === 'function') {
            aggregation.col.treeAggregationFinalizerFn(aggregation);
          }
          if (typeof(aggregation.col.customTreeAggregationFinalizerFn) === 'function') {
            aggregation.col.customTreeAggregationFinalizerFn(aggregation);
          }
          if (typeof(aggregation.rendered) === 'undefined') {
            aggregation.rendered = aggregation.label ? aggregation.label + aggregation.value : aggregation.value;
          }
        },
        finaliseAggregations: function(row) {
          if (typeof(row.treeNode.aggregations) === 'undefined') {
            return;
          }
          row.treeNode.aggregations.forEach(function(aggregation) {
            service.finaliseAggregation(row, aggregation);
            if (aggregation.col.treeAggregationUpdateEntity) {
              var aggregationCopy = {};
              angular.forEach(aggregation, function(value, key) {
                if (aggregation.hasOwnProperty(key) && key !== 'col') {
                  aggregationCopy[key] = value;
                }
              });
              row.entity['$$' + aggregation.col.uid] = aggregationCopy;
            }
          });
        },
        treeFooterAggregationType: function(rows, column) {
          service.finaliseAggregation(undefined, column.treeFooterAggregation);
          if (typeof(column.treeFooterAggregation.value) === 'undefined' || column.treeFooterAggregation.rendered === null) {
            return '';
          }
          return column.treeFooterAggregation.rendered;
        }
      };
      return service;
    }]);
    module.directive('uiGridTreeBaseRowHeaderButtons', ['$templateCache', 'uiGridTreeBaseService', function($templateCache, uiGridTreeBaseService) {
      return {
        replace: true,
        restrict: 'E',
        template: $templateCache.get('ui-grid/treeBaseRowHeaderButtons'),
        scope: true,
        require: '^uiGrid',
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          var self = uiGridCtrl.grid;
          $scope.treeButtonClick = function(row, evt) {
            uiGridTreeBaseService.toggleRowTreeState(self, row, evt);
          };
        }
      };
    }]);
    module.directive('uiGridTreeBaseExpandAllButtons', ['$templateCache', 'uiGridTreeBaseService', function($templateCache, uiGridTreeBaseService) {
      return {
        replace: true,
        restrict: 'E',
        template: $templateCache.get('ui-grid/treeBaseExpandAllButtons'),
        scope: false,
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          var self = $scope.col.grid;
          $scope.headerButtonClick = function(row, evt) {
            if (self.treeBase.expandAll) {
              uiGridTreeBaseService.collapseAllRows(self, evt);
            } else {
              uiGridTreeBaseService.expandAllRows(self, evt);
            }
          };
        }
      };
    }]);
    module.directive('uiGridViewport', ['$compile', 'uiGridConstants', 'gridUtil', '$parse', function($compile, uiGridConstants, gridUtil, $parse) {
      return {
        priority: -200,
        scope: false,
        compile: function($elm, $attrs) {
          var rowRepeatDiv = angular.element($elm.children().children()[0]);
          var existingNgClass = rowRepeatDiv.attr("ng-class");
          var newNgClass = '';
          if (existingNgClass) {
            newNgClass = existingNgClass.slice(0, -1) + ",'ui-grid-tree-header-row': row.treeLevel > -1}";
          } else {
            newNgClass = "{'ui-grid-tree-header-row': row.treeLevel > -1}";
          }
          rowRepeatDiv.attr("ng-class", newNgClass);
          return {
            pre: function($scope, $elm, $attrs, controllers) {},
            post: function($scope, $elm, $attrs, controllers) {}
          };
        }
      };
    }]);
  })();
  (function() {
    'use strict';
    var module = angular.module('ui.grid.treeView', ['ui.grid', 'ui.grid.treeBase']);
    module.constant('uiGridTreeViewConstants', {
      featureName: "treeView",
      rowHeaderColName: 'treeBaseRowHeaderCol',
      EXPANDED: 'expanded',
      COLLAPSED: 'collapsed',
      aggregation: {
        COUNT: 'count',
        SUM: 'sum',
        MAX: 'max',
        MIN: 'min',
        AVG: 'avg'
      }
    });
    module.service('uiGridTreeViewService', ['$q', 'uiGridTreeViewConstants', 'uiGridTreeBaseConstants', 'uiGridTreeBaseService', 'gridUtil', 'GridRow', 'gridClassFactory', 'i18nService', 'uiGridConstants', function($q, uiGridTreeViewConstants, uiGridTreeBaseConstants, uiGridTreeBaseService, gridUtil, GridRow, gridClassFactory, i18nService, uiGridConstants) {
      var service = {
        initializeGrid: function(grid, $scope) {
          uiGridTreeBaseService.initializeGrid(grid, $scope);
          grid.treeView = {};
          grid.registerRowsProcessor(service.adjustSorting, 60);
          var publicApi = {
            events: {treeView: {}},
            methods: {treeView: {}}
          };
          grid.api.registerEventsFromObject(publicApi.events);
          grid.api.registerMethodsFromObject(publicApi.methods);
        },
        defaultGridOptions: function(gridOptions) {
          gridOptions.enableTreeView = gridOptions.enableTreeView !== false;
        },
        adjustSorting: function(renderableRows) {
          var grid = this;
          grid.columns.forEach(function(column) {
            if (column.sort) {
              column.sort.ignoreSort = true;
            }
          });
          return renderableRows;
        }
      };
      return service;
    }]);
    module.directive('uiGridTreeView', ['uiGridTreeViewConstants', 'uiGridTreeViewService', '$templateCache', function(uiGridTreeViewConstants, uiGridTreeViewService, $templateCache) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        compile: function() {
          return {
            pre: function($scope, $elm, $attrs, uiGridCtrl) {
              if (uiGridCtrl.grid.options.enableTreeView !== false) {
                uiGridTreeViewService.initializeGrid(uiGridCtrl.grid, $scope);
              }
            },
            post: function($scope, $elm, $attrs, uiGridCtrl) {}
          };
        }
      };
    }]);
  })();
  (function() {
    'use strict';
    var module = angular.module('ui.grid.validate', ['ui.grid']);
    module.service('uiGridValidateService', ['$sce', '$q', '$http', 'i18nService', 'uiGridConstants', function($sce, $q, $http, i18nService, uiGridConstants) {
      var service = {
        validatorFactories: {},
        setExternalFactoryFunction: function(externalFactoryFunction) {
          service.externalFactoryFunction = externalFactoryFunction;
        },
        clearExternalFactory: function() {
          delete service.externalFactoryFunction;
        },
        getValidatorFromExternalFactory: function(name, argument) {
          return service.externalFactoryFunction(name, argument).validatorFactory(argument);
        },
        getMessageFromExternalFactory: function(name, argument) {
          return service.externalFactoryFunction(name, argument).messageFunction(argument);
        },
        setValidator: function(name, validatorFactory, messageFunction) {
          service.validatorFactories[name] = {
            validatorFactory: validatorFactory,
            messageFunction: messageFunction
          };
        },
        getValidator: function(name, argument) {
          if (service.externalFactoryFunction) {
            var validator = service.getValidatorFromExternalFactory(name, argument);
            if (validator) {
              return validator;
            }
          }
          if (!service.validatorFactories[name]) {
            throw ("Invalid validator name: " + name);
          }
          return service.validatorFactories[name].validatorFactory(argument);
        },
        getMessage: function(name, argument) {
          if (service.externalFactoryFunction) {
            var message = service.getMessageFromExternalFactory(name, argument);
            if (message) {
              return message;
            }
          }
          return service.validatorFactories[name].messageFunction(argument);
        },
        isInvalid: function(rowEntity, colDef) {
          return rowEntity['$$invalid' + colDef.name];
        },
        setInvalid: function(rowEntity, colDef) {
          rowEntity['$$invalid' + colDef.name] = true;
        },
        setValid: function(rowEntity, colDef) {
          delete rowEntity['$$invalid' + colDef.name];
        },
        setError: function(rowEntity, colDef, validatorName) {
          if (!rowEntity['$$errors' + colDef.name]) {
            rowEntity['$$errors' + colDef.name] = {};
          }
          rowEntity['$$errors' + colDef.name][validatorName] = true;
        },
        clearError: function(rowEntity, colDef, validatorName) {
          if (!rowEntity['$$errors' + colDef.name]) {
            return;
          }
          if (validatorName in rowEntity['$$errors' + colDef.name]) {
            delete rowEntity['$$errors' + colDef.name][validatorName];
          }
        },
        getErrorMessages: function(rowEntity, colDef) {
          var errors = [];
          if (!rowEntity['$$errors' + colDef.name] || Object.keys(rowEntity['$$errors' + colDef.name]).length === 0) {
            return errors;
          }
          Object.keys(rowEntity['$$errors' + colDef.name]).sort().forEach(function(validatorName) {
            errors.push(service.getMessage(validatorName, colDef.validators[validatorName]));
          });
          return errors;
        },
        getFormattedErrors: function(rowEntity, colDef) {
          var msgString = "";
          var errors = service.getErrorMessages(rowEntity, colDef);
          if (!errors.length) {
            return;
          }
          errors.forEach(function(errorMsg) {
            msgString += errorMsg + "<br/>";
          });
          return $sce.trustAsHtml('<p><b>' + i18nService.getSafeText('validate.error') + '</b></p>' + msgString);
        },
        getTitleFormattedErrors: function(rowEntity, colDef) {
          var newLine = "\n";
          var msgString = "";
          var errors = service.getErrorMessages(rowEntity, colDef);
          if (!errors.length) {
            return;
          }
          errors.forEach(function(errorMsg) {
            msgString += errorMsg + newLine;
          });
          return $sce.trustAsHtml(i18nService.getSafeText('validate.error') + newLine + msgString);
        },
        runValidators: function(rowEntity, colDef, newValue, oldValue, grid) {
          if (newValue === oldValue) {
            return;
          }
          if (typeof(colDef.name) === 'undefined' || !colDef.name) {
            throw new Error('colDef.name is required to perform validation');
          }
          service.setValid(rowEntity, colDef);
          var validateClosureFactory = function(rowEntity, colDef, validatorName) {
            return function(value) {
              if (!value) {
                service.setInvalid(rowEntity, colDef);
                service.setError(rowEntity, colDef, validatorName);
                if (grid) {
                  grid.api.validate.raise.validationFailed(rowEntity, colDef, newValue, oldValue);
                }
              }
            };
          };
          for (var validatorName in colDef.validators) {
            service.clearError(rowEntity, colDef, validatorName);
            var msg;
            var validatorFunction = service.getValidator(validatorName, colDef.validators[validatorName]);
            $q.when(validatorFunction(oldValue, newValue, rowEntity, colDef)).then(validateClosureFactory(rowEntity, colDef, validatorName));
          }
        },
        createDefaultValidators: function() {
          service.setValidator('minLength', function(argument) {
            return function(oldValue, newValue, rowEntity, colDef) {
              if (newValue === undefined || newValue === null || newValue === '') {
                return true;
              }
              return newValue.length >= argument;
            };
          }, function(argument) {
            return i18nService.getSafeText('validate.minLength').replace('THRESHOLD', argument);
          });
          service.setValidator('maxLength', function(argument) {
            return function(oldValue, newValue, rowEntity, colDef) {
              if (newValue === undefined || newValue === null || newValue === '') {
                return true;
              }
              return newValue.length <= argument;
            };
          }, function(threshold) {
            return i18nService.getSafeText('validate.maxLength').replace('THRESHOLD', threshold);
          });
          service.setValidator('required', function(argument) {
            return function(oldValue, newValue, rowEntity, colDef) {
              if (argument) {
                return !(newValue === undefined || newValue === null || newValue === '');
              }
              return true;
            };
          }, function(argument) {
            return i18nService.getSafeText('validate.required');
          });
        },
        initializeGrid: function(scope, grid) {
          grid.validate = {
            isInvalid: service.isInvalid,
            getFormattedErrors: service.getFormattedErrors,
            getTitleFormattedErrors: service.getTitleFormattedErrors,
            runValidators: service.runValidators
          };
          var publicApi = {
            events: {validate: {validationFailed: function(rowEntity, colDef, newValue, oldValue) {}}},
            methods: {validate: {
                isInvalid: function(rowEntity, colDef) {
                  return grid.validate.isInvalid(rowEntity, colDef);
                },
                getErrorMessages: function(rowEntity, colDef) {
                  return grid.validate.getErrorMessages(rowEntity, colDef);
                },
                getFormattedErrors: function(rowEntity, colDef) {
                  return grid.validate.getFormattedErrors(rowEntity, colDef);
                },
                getTitleFormattedErrors: function(rowEntity, colDef) {
                  return grid.validate.getTitleFormattedErrors(rowEntity, colDef);
                }
              }}
          };
          grid.api.registerEventsFromObject(publicApi.events);
          grid.api.registerMethodsFromObject(publicApi.methods);
          if (grid.edit) {
            grid.api.edit.on.afterCellEdit(scope, function(rowEntity, colDef, newValue, oldValue) {
              grid.validate.runValidators(rowEntity, colDef, newValue, oldValue, grid);
            });
          }
          service.createDefaultValidators();
        }
      };
      return service;
    }]);
    module.directive('uiGridValidate', ['gridUtil', 'uiGridValidateService', function(gridUtil, uiGridValidateService) {
      return {
        priority: 0,
        replace: true,
        require: '^uiGrid',
        scope: false,
        compile: function() {
          return {
            pre: function($scope, $elm, $attrs, uiGridCtrl) {
              uiGridValidateService.initializeGrid($scope, uiGridCtrl.grid);
            },
            post: function($scope, $elm, $attrs, uiGridCtrl) {}
          };
        }
      };
    }]);
  })();
  angular.module('ui.grid').run(['$templateCache', function($templateCache) {
    'use strict';
    $templateCache.put('ui-grid/ui-grid-filter', "<div class=\"ui-grid-filter-container\" ng-repeat=\"colFilter in col.filters\" ng-class=\"{'ui-grid-filter-cancel-button-hidden' : colFilter.disableCancelFilterButton === true }\"><div ng-if=\"colFilter.type !== 'select'\"><input type=\"text\" class=\"ui-grid-filter-input ui-grid-filter-input-{{$index}}\" ng-model=\"colFilter.term\" ng-attr-placeholder=\"{{colFilter.placeholder || ''}}\" aria-label=\"{{colFilter.ariaLabel || aria.defaultFilterLabel}}\"><div role=\"button\" class=\"ui-grid-filter-button\" ng-click=\"removeFilter(colFilter, $index)\" ng-if=\"!colFilter.disableCancelFilterButton\" ng-disabled=\"colFilter.term === undefined || colFilter.term === null || colFilter.term === ''\" ng-show=\"colFilter.term !== undefined && colFilter.term !== null && colFilter.term !== ''\"><i class=\"ui-grid-icon-cancel\" ui-grid-one-bind-aria-label=\"aria.removeFilter\">&nbsp;</i></div></div><div ng-if=\"colFilter.type === 'select'\"><select class=\"ui-grid-filter-select ui-grid-filter-input-{{$index}}\" ng-model=\"colFilter.term\" ng-attr-placeholder=\"{{colFilter.placeholder || aria.defaultFilterLabel}}\" aria-label=\"{{colFilter.ariaLabel || ''}}\" ng-options=\"option.value as option.label for option in colFilter.selectOptions\"><option value=\"\"></option></select><div role=\"button\" class=\"ui-grid-filter-button-select\" ng-click=\"removeFilter(colFilter, $index)\" ng-if=\"!colFilter.disableCancelFilterButton\" ng-disabled=\"colFilter.term === undefined || colFilter.term === null || colFilter.term === ''\" ng-show=\"colFilter.term !== undefined && colFilter.term != null\"><i class=\"ui-grid-icon-cancel\" ui-grid-one-bind-aria-label=\"aria.removeFilter\">&nbsp;</i></div></div></div>");
    $templateCache.put('ui-grid/ui-grid-footer', "<div class=\"ui-grid-footer-panel ui-grid-footer-aggregates-row\"><!-- tfooter --><div class=\"ui-grid-footer ui-grid-footer-viewport\"><div class=\"ui-grid-footer-canvas\"><div class=\"ui-grid-footer-cell-wrapper\" ng-style=\"colContainer.headerCellWrapperStyle()\"><div role=\"row\" class=\"ui-grid-footer-cell-row\"><div ui-grid-footer-cell role=\"gridcell\" ng-repeat=\"col in colContainer.renderedColumns track by col.uid\" col=\"col\" render-index=\"$index\" class=\"ui-grid-footer-cell ui-grid-clearfix\"></div></div></div></div></div></div>");
    $templateCache.put('ui-grid/ui-grid-grid-footer', "<div class=\"ui-grid-footer-info ui-grid-grid-footer\"><span>{{'search.totalItems' | t}} {{grid.rows.length}}</span> <span ng-if=\"grid.renderContainers.body.visibleRowCache.length !== grid.rows.length\" class=\"ngLabel\">({{\"search.showingItems\" | t}} {{grid.renderContainers.body.visibleRowCache.length}})</span></div>");
    $templateCache.put('ui-grid/ui-grid-group-panel', "<div class=\"ui-grid-group-panel\"><div ui-t=\"groupPanel.description\" class=\"description\" ng-show=\"groupings.length == 0\"></div><ul ng-show=\"groupings.length > 0\" class=\"ngGroupList\"><li class=\"ngGroupItem\" ng-repeat=\"group in configGroups\"><span class=\"ngGroupElement\"><span class=\"ngGroupName\">{{group.displayName}} <span ng-click=\"removeGroup($index)\" class=\"ngRemoveGroup\">x</span></span> <span ng-hide=\"$last\" class=\"ngGroupArrow\"></span></span></li></ul></div>");
    $templateCache.put('ui-grid/ui-grid-header', "<div role=\"rowgroup\" class=\"ui-grid-header\"><!-- theader --><div class=\"ui-grid-top-panel\"><div class=\"ui-grid-header-viewport\"><div class=\"ui-grid-header-canvas\"><div class=\"ui-grid-header-cell-wrapper\" ng-style=\"colContainer.headerCellWrapperStyle()\"><div role=\"row\" class=\"ui-grid-header-cell-row\"><div class=\"ui-grid-header-cell ui-grid-clearfix\" ng-repeat=\"col in colContainer.renderedColumns track by col.uid\" ui-grid-header-cell col=\"col\" render-index=\"$index\"></div></div></div></div></div></div></div>");
    $templateCache.put('ui-grid/ui-grid-menu-button', "<div class=\"ui-grid-menu-button\"><div role=\"button\" ui-grid-one-bind-id-grid=\"'grid-menu'\" class=\"ui-grid-icon-container\" ng-click=\"toggleMenu()\" aria-haspopup=\"true\"><i class=\"ui-grid-icon-menu\" ui-grid-one-bind-aria-label=\"i18n.aria.buttonLabel\">&nbsp;</i></div><div ui-grid-menu menu-items=\"menuItems\"></div></div>");
    $templateCache.put('ui-grid/ui-grid-no-header', "<div class=\"ui-grid-top-panel\"></div>");
    $templateCache.put('ui-grid/ui-grid-row', "<div ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.uid\" ui-grid-one-bind-id-grid=\"rowRenderIndex + '-' + col.uid + '-cell'\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" role=\"{{col.isRowHeader ? 'rowheader' : 'gridcell'}}\" ui-grid-cell></div>");
    $templateCache.put('ui-grid/ui-grid', "<div ui-i18n=\"en\" class=\"ui-grid\"><!-- TODO (c0bra): add \"scoped\" attr here, eventually? --><style ui-grid-style>.grid{{ grid.id }} {\n" + "      /* Styles for the grid */\n" + "    }\n" + "\n" + "    .grid{{ grid.id }} .ui-grid-row, .grid{{ grid.id }} .ui-grid-cell, .grid{{ grid.id }} .ui-grid-cell .ui-grid-vertical-bar {\n" + "      height: {{ grid.options.rowHeight }}px;\n" + "    }\n" + "\n" + "    .grid{{ grid.id }} .ui-grid-row:last-child .ui-grid-cell {\n" + "      border-bottom-width: {{ ((grid.getTotalRowHeight() < grid.getViewportHeight()) && '1') || '0' }}px;\n" + "    }\n" + "\n" + "    {{ grid.verticalScrollbarStyles }}\n" + "    {{ grid.horizontalScrollbarStyles }}\n" + "\n" + "    /*\n" + "    .ui-grid[dir=rtl] .ui-grid-viewport {\n" + "      padding-left: {{ grid.verticalScrollbarWidth }}px;\n" + "    }\n" + "    */\n" + "\n" + "    {{ grid.customStyles }}</style><div class=\"ui-grid-contents-wrapper\"><div ui-grid-menu-button ng-if=\"grid.options.enableGridMenu\"></div><div ng-if=\"grid.hasLeftContainer()\" style=\"width: 0\" ui-grid-pinned-container=\"'left'\"></div><div ui-grid-render-container container-id=\"'body'\" col-container-name=\"'body'\" row-container-name=\"'body'\" bind-scroll-horizontal=\"true\" bind-scroll-vertical=\"true\" enable-horizontal-scrollbar=\"grid.options.enableHorizontalScrollbar\" enable-vertical-scrollbar=\"grid.options.enableVerticalScrollbar\"></div><div ng-if=\"grid.hasRightContainer()\" style=\"width: 0\" ui-grid-pinned-container=\"'right'\"></div><div ui-grid-grid-footer ng-if=\"grid.options.showGridFooter\"></div><div ui-grid-column-menu ng-if=\"grid.options.enableColumnMenus\"></div><div ng-transclude></div></div></div>");
    $templateCache.put('ui-grid/uiGridCell', "<div class=\"ui-grid-cell-contents\" title=\"TOOLTIP\">{{COL_FIELD CUSTOM_FILTERS}}</div>");
    $templateCache.put('ui-grid/uiGridColumnMenu', "<div class=\"ui-grid-column-menu\"><div ui-grid-menu menu-items=\"menuItems\"><!-- <div class=\"ui-grid-column-menu\">\n" + "    <div class=\"inner\" ng-show=\"menuShown\">\n" + "      <ul>\n" + "        <div ng-show=\"grid.options.enableSorting\">\n" + "          <li ng-click=\"sortColumn($event, asc)\" ng-class=\"{ 'selected' : col.sort.direction == asc }\"><i class=\"ui-grid-icon-sort-alt-up\"></i> Sort Ascending</li>\n" + "          <li ng-click=\"sortColumn($event, desc)\" ng-class=\"{ 'selected' : col.sort.direction == desc }\"><i class=\"ui-grid-icon-sort-alt-down\"></i> Sort Descending</li>\n" + "          <li ng-show=\"col.sort.direction\" ng-click=\"unsortColumn()\"><i class=\"ui-grid-icon-cancel\"></i> Remove Sort</li>\n" + "        </div>\n" + "      </ul>\n" + "    </div>\n" + "  </div> --></div></div>");
    $templateCache.put('ui-grid/uiGridFooterCell', "<div class=\"ui-grid-cell-contents\" col-index=\"renderIndex\"><div>{{ col.getAggregationText() + ( col.getAggregationValue() CUSTOM_FILTERS ) }}</div></div>");
    $templateCache.put('ui-grid/uiGridHeaderCell', "<div role=\"columnheader\" ng-class=\"{ 'sortable': sortable }\" ui-grid-one-bind-aria-labelledby-grid=\"col.uid + '-header-text ' + col.uid + '-sortdir-text'\" aria-sort=\"{{col.sort.direction == asc ? 'ascending' : ( col.sort.direction == desc ? 'descending' : (!col.sort.direction ? 'none' : 'other'))}}\"><div role=\"button\" tabindex=\"0\" class=\"ui-grid-cell-contents ui-grid-header-cell-primary-focus\" col-index=\"renderIndex\" title=\"TOOLTIP\"><span class=\"ui-grid-header-cell-label\" ui-grid-one-bind-id-grid=\"col.uid + '-header-text'\">{{ col.displayName CUSTOM_FILTERS }}</span> <span ui-grid-one-bind-id-grid=\"col.uid + '-sortdir-text'\" ui-grid-visible=\"col.sort.direction\" aria-label=\"{{getSortDirectionAriaLabel()}}\"><i ng-class=\"{ 'ui-grid-icon-up-dir': col.sort.direction == asc, 'ui-grid-icon-down-dir': col.sort.direction == desc, 'ui-grid-icon-blank': !col.sort.direction }\" title=\"{{isSortPriorityVisible() ? i18n.headerCell.priority + ' ' + ( col.sort.priority + 1 )  : null}}\" aria-hidden=\"true\"></i> <sub ui-grid-visible=\"isSortPriorityVisible()\" class=\"ui-grid-sort-priority-number\">{{col.sort.priority + 1}}</sub></span></div><div role=\"button\" tabindex=\"0\" ui-grid-one-bind-id-grid=\"col.uid + '-menu-button'\" class=\"ui-grid-column-menu-button\" ng-if=\"grid.options.enableColumnMenus && !col.isRowHeader  && col.colDef.enableColumnMenu !== false\" ng-click=\"toggleMenu($event)\" ng-class=\"{'ui-grid-column-menu-button-last-col': isLastCol}\" ui-grid-one-bind-aria-label=\"i18n.headerCell.aria.columnMenuButtonLabel\" aria-haspopup=\"true\"><i class=\"ui-grid-icon-angle-down\" aria-hidden=\"true\">&nbsp;</i></div><div ui-grid-filter></div></div>");
    $templateCache.put('ui-grid/uiGridMenu', "<div class=\"ui-grid-menu\" ng-if=\"shown\"><style ui-grid-style>{{dynamicStyles}}</style><div class=\"ui-grid-menu-mid\" ng-show=\"shownMid\"><div class=\"ui-grid-menu-inner\"><ul role=\"menu\" class=\"ui-grid-menu-items\"><li ng-repeat=\"item in menuItems\" role=\"menuitem\" ui-grid-menu-item ui-grid-one-bind-id=\"'menuitem-'+$index\" action=\"item.action\" name=\"item.title\" active=\"item.active\" icon=\"item.icon\" shown=\"item.shown\" context=\"item.context\" template-url=\"item.templateUrl\" leave-open=\"item.leaveOpen\" screen-reader-only=\"item.screenReaderOnly\"></li></ul></div></div></div>");
    $templateCache.put('ui-grid/uiGridMenuItem', "<button type=\"button\" class=\"ui-grid-menu-item\" ng-click=\"itemAction($event, title)\" ng-show=\"itemShown()\" ng-class=\"{ 'ui-grid-menu-item-active': active(), 'ui-grid-sr-only': (!focus && screenReaderOnly) }\" aria-pressed=\"{{active()}}\" tabindex=\"0\" ng-focus=\"focus=true\" ng-blur=\"focus=false\"><i ng-class=\"icon\" aria-hidden=\"true\">&nbsp;</i> {{ name }}</button>");
    $templateCache.put('ui-grid/uiGridRenderContainer', "<div role=\"grid\" ui-grid-one-bind-id-grid=\"'grid-container'\" class=\"ui-grid-render-container\" ng-style=\"{ 'margin-left': colContainer.getMargin('left') + 'px', 'margin-right': colContainer.getMargin('right') + 'px' }\"><!-- All of these dom elements are replaced in place --><div ui-grid-header></div><div ui-grid-viewport></div><div ng-if=\"colContainer.needsHScrollbarPlaceholder()\" class=\"ui-grid-scrollbar-placeholder\" ng-style=\"{height:colContainer.grid.scrollbarHeight + 'px'}\"></div><ui-grid-footer ng-if=\"grid.options.showColumnFooter\"></ui-grid-footer></div>");
    $templateCache.put('ui-grid/uiGridViewport', "<div role=\"rowgroup\" class=\"ui-grid-viewport\" ng-style=\"colContainer.getViewportStyle()\"><!-- tbody --><div class=\"ui-grid-canvas\"><div ng-repeat=\"(rowRenderIndex, row) in rowContainer.renderedRows track by $index\" class=\"ui-grid-row\" ng-style=\"Viewport.rowStyle(rowRenderIndex)\"><div role=\"row\" ui-grid-row=\"row\" row-render-index=\"rowRenderIndex\"></div></div></div></div>");
    $templateCache.put('ui-grid/cellEditor', "<div><form name=\"inputForm\"><input type=\"INPUT_TYPE\" ng-class=\"'colt' + col.uid\" ui-grid-editor ng-model=\"MODEL_COL_FIELD\"></form></div>");
    $templateCache.put('ui-grid/dropdownEditor', "<div><form name=\"inputForm\"><select ng-class=\"'colt' + col.uid\" ui-grid-edit-dropdown ng-model=\"MODEL_COL_FIELD\" ng-options=\"field[editDropdownIdLabel] as field[editDropdownValueLabel] CUSTOM_FILTERS for field in editDropdownOptionsArray\"></select></form></div>");
    $templateCache.put('ui-grid/fileChooserEditor', "<div><form name=\"inputForm\"><input ng-class=\"'colt' + col.uid\" ui-grid-edit-file-chooser type=\"file\" id=\"files\" name=\"files[]\" ng-model=\"MODEL_COL_FIELD\"></form></div>");
    $templateCache.put('ui-grid/expandableRow', "<div ui-grid-expandable-row ng-if=\"expandableRow.shouldRenderExpand()\" class=\"expandableRow\" style=\"float:left; margin-top: 1px; margin-bottom: 1px\" ng-style=\"{width: (grid.renderContainers.body.getCanvasWidth()) + 'px', height: row.expandedRowHeight + 'px'}\"></div>");
    $templateCache.put('ui-grid/expandableRowHeader', "<div class=\"ui-grid-row-header-cell ui-grid-expandable-buttons-cell\"><div class=\"ui-grid-cell-contents\"><i ng-class=\"{ 'ui-grid-icon-plus-squared' : !row.isExpanded, 'ui-grid-icon-minus-squared' : row.isExpanded }\" ng-click=\"grid.api.expandable.toggleRowExpansion(row.entity)\"></i></div></div>");
    $templateCache.put('ui-grid/expandableScrollFiller', "<div ng-if=\"expandableRow.shouldRenderFiller()\" ng-class=\"{scrollFiller:true, scrollFillerClass:(colContainer.name === 'body')}\" ng-style=\"{ width: (grid.getViewportWidth()) + 'px', height: row.expandedRowHeight + 2 + 'px', 'margin-left': grid.options.rowHeader.rowHeaderWidth + 'px' }\"><i class=\"ui-grid-icon-spin5 ui-grid-animate-spin\" ng-style=\"{'margin-top': ( row.expandedRowHeight/2 - 5) + 'px', 'margin-left' : ((grid.getViewportWidth() - grid.options.rowHeader.rowHeaderWidth)/2 - 5) + 'px'}\"></i></div>");
    $templateCache.put('ui-grid/expandableTopRowHeader', "<div class=\"ui-grid-row-header-cell ui-grid-expandable-buttons-cell\"><div class=\"ui-grid-cell-contents\"><i ng-class=\"{ 'ui-grid-icon-plus-squared' : !grid.expandable.expandedAll, 'ui-grid-icon-minus-squared' : grid.expandable.expandedAll }\" ng-click=\"grid.api.expandable.toggleAllRows()\"></i></div></div>");
    $templateCache.put('ui-grid/csvLink', "<span class=\"ui-grid-exporter-csv-link-span\"><a href=\"data:text/csv;charset=UTF-8,CSV_CONTENT\" download=\"FILE_NAME\">LINK_LABEL</a></span>");
    $templateCache.put('ui-grid/importerMenuItem', "<li class=\"ui-grid-menu-item\"><form><input class=\"ui-grid-importer-file-chooser\" type=\"file\" id=\"files\" name=\"files[]\"></form></li>");
    $templateCache.put('ui-grid/importerMenuItemContainer', "<div ui-grid-importer-menu-item></div>");
    $templateCache.put('ui-grid/pagination', "<div role=\"contentinfo\" class=\"ui-grid-pager-panel\" ui-grid-pager ng-show=\"grid.options.enablePaginationControls\"><div role=\"navigation\" class=\"ui-grid-pager-container\"><div role=\"menubar\" class=\"ui-grid-pager-control\"><button type=\"button\" role=\"menuitem\" class=\"ui-grid-pager-first\" ui-grid-one-bind-title=\"aria.pageToFirst\" ui-grid-one-bind-aria-label=\"aria.pageToFirst\" ng-click=\"pageFirstPageClick()\" ng-disabled=\"cantPageBackward()\"><div ng-class=\"grid.isRTL() ? 'last-triangle' : 'first-triangle'\"><div ng-class=\"grid.isRTL() ? 'last-bar-rtl' : 'first-bar'\"></div></div></button> <button type=\"button\" role=\"menuitem\" class=\"ui-grid-pager-previous\" ui-grid-one-bind-title=\"aria.pageBack\" ui-grid-one-bind-aria-label=\"aria.pageBack\" ng-click=\"pagePreviousPageClick()\" ng-disabled=\"cantPageBackward()\"><div ng-class=\"grid.isRTL() ? 'last-triangle prev-triangle' : 'first-triangle prev-triangle'\"></div></button> <input type=\"number\" ui-grid-one-bind-title=\"aria.pageSelected\" ui-grid-one-bind-aria-label=\"aria.pageSelected\" class=\"ui-grid-pager-control-input\" ng-model=\"grid.options.paginationCurrentPage\" min=\"1\" max=\"{{ paginationApi.getTotalPages() }}\" required> <span class=\"ui-grid-pager-max-pages-number\" ng-show=\"paginationApi.getTotalPages() > 0\"><abbr ui-grid-one-bind-title=\"paginationOf\">/</abbr> {{ paginationApi.getTotalPages() }}</span> <button type=\"button\" role=\"menuitem\" class=\"ui-grid-pager-next\" ui-grid-one-bind-title=\"aria.pageForward\" ui-grid-one-bind-aria-label=\"aria.pageForward\" ng-click=\"pageNextPageClick()\" ng-disabled=\"cantPageForward()\"><div ng-class=\"grid.isRTL() ? 'first-triangle next-triangle' : 'last-triangle next-triangle'\"></div></button> <button type=\"button\" role=\"menuitem\" class=\"ui-grid-pager-last\" ui-grid-one-bind-title=\"aria.pageToLast\" ui-grid-one-bind-aria-label=\"aria.pageToLast\" ng-click=\"pageLastPageClick()\" ng-disabled=\"cantPageToLast()\"><div ng-class=\"grid.isRTL() ? 'first-triangle' : 'last-triangle'\"><div ng-class=\"grid.isRTL() ? 'first-bar-rtl' : 'last-bar'\"></div></div></button></div><div class=\"ui-grid-pager-row-count-picker\" ng-if=\"grid.options.paginationPageSizes.length > 1\"><select ui-grid-one-bind-aria-labelledby-grid=\"'items-per-page-label'\" ng-model=\"grid.options.paginationPageSize\" ng-options=\"o as o for o in grid.options.paginationPageSizes\"></select><span ui-grid-one-bind-id-grid=\"'items-per-page-label'\" class=\"ui-grid-pager-row-count-label\">&nbsp;{{sizesLabel}}</span></div><span ng-if=\"grid.options.paginationPageSizes.length <= 1\" class=\"ui-grid-pager-row-count-label\">{{grid.options.paginationPageSize}}&nbsp;{{sizesLabel}}</span></div><div class=\"ui-grid-pager-count-container\"><div class=\"ui-grid-pager-count\"><span ng-show=\"grid.options.totalItems > 0\">{{showingLow}} <abbr ui-grid-one-bind-title=\"paginationThrough\">-</abbr> {{showingHigh}} {{paginationOf}} {{grid.options.totalItems}} {{totalItemsLabel}}</span></div></div></div>");
    $templateCache.put('ui-grid/columnResizer', "<div ui-grid-column-resizer ng-if=\"grid.options.enableColumnResizing\" class=\"ui-grid-column-resizer\" col=\"col\" position=\"right\" render-index=\"renderIndex\" unselectable=\"on\"></div>");
    $templateCache.put('ui-grid/gridFooterSelectedItems', "<span ng-if=\"grid.selection.selectedCount !== 0 && grid.options.enableFooterTotalSelected\">({{\"search.selectedItems\" | t}} {{grid.selection.selectedCount}})</span>");
    $templateCache.put('ui-grid/selectionHeaderCell', "<div><!-- <div class=\"ui-grid-vertical-bar\">&nbsp;</div> --><div class=\"ui-grid-cell-contents\" col-index=\"renderIndex\"><ui-grid-selection-select-all-buttons ng-if=\"grid.options.enableSelectAll\"></ui-grid-selection-select-all-buttons></div></div>");
    $templateCache.put('ui-grid/selectionRowHeader', "<div class=\"ui-grid-disable-selection\"><div class=\"ui-grid-cell-contents\"><ui-grid-selection-row-header-buttons></ui-grid-selection-row-header-buttons></div></div>");
    $templateCache.put('ui-grid/selectionRowHeaderButtons', "<div class=\"ui-grid-selection-row-header-buttons ui-grid-icon-ok\" ng-class=\"{'ui-grid-row-selected': row.isSelected}\" ng-click=\"selectButtonClick(row, $event)\">&nbsp;</div>");
    $templateCache.put('ui-grid/selectionSelectAllButtons', "<div class=\"ui-grid-selection-row-header-buttons ui-grid-icon-ok\" ng-class=\"{'ui-grid-all-selected': grid.selection.selectAll}\" ng-click=\"headerButtonClick($event)\"></div>");
    $templateCache.put('ui-grid/treeBaseExpandAllButtons', "<div class=\"ui-grid-tree-base-row-header-buttons\" ng-class=\"{'ui-grid-icon-minus-squared': grid.treeBase.numberLevels > 0 && grid.treeBase.expandAll, 'ui-grid-icon-plus-squared': grid.treeBase.numberLevels > 0 && !grid.treeBase.expandAll}\" ng-click=\"headerButtonClick($event)\"></div>");
    $templateCache.put('ui-grid/treeBaseHeaderCell', "<div><div class=\"ui-grid-cell-contents\" col-index=\"renderIndex\"><ui-grid-tree-base-expand-all-buttons ng-if=\"grid.options.enableExpandAll\"></ui-grid-tree-base-expand-all-buttons></div></div>");
    $templateCache.put('ui-grid/treeBaseRowHeader', "<div class=\"ui-grid-cell-contents\"><ui-grid-tree-base-row-header-buttons></ui-grid-tree-base-row-header-buttons></div>");
    $templateCache.put('ui-grid/treeBaseRowHeaderButtons', "<div class=\"ui-grid-tree-base-row-header-buttons\" ng-class=\"{'ui-grid-tree-base-header': row.treeLevel > -1 }\" ng-click=\"treeButtonClick(row, $event)\"><i ng-class=\"{'ui-grid-icon-minus-squared': ( ( grid.options.showTreeExpandNoChildren && row.treeLevel > -1 ) || ( row.treeNode.children && row.treeNode.children.length > 0 ) ) && row.treeNode.state === 'expanded', 'ui-grid-icon-plus-squared': ( ( grid.options.showTreeExpandNoChildren && row.treeLevel > -1 ) || ( row.treeNode.children && row.treeNode.children.length > 0 ) ) && row.treeNode.state === 'collapsed'}\" ng-style=\"{'padding-left': grid.options.treeIndent * row.treeLevel + 'px'}\"></i> &nbsp;</div>");
    $templateCache.put('ui-grid/cellTitleValidator', "<div class=\"ui-grid-cell-contents\" ng-class=\"{invalid:grid.validate.isInvalid(row.entity,col.colDef)}\" title=\"{{grid.validate.getTitleFormattedErrors(row.entity,col.colDef)}}\">{{COL_FIELD CUSTOM_FILTERS}}</div>");
    $templateCache.put('ui-grid/cellTooltipValidator', "<div class=\"ui-grid-cell-contents\" ng-class=\"{invalid:grid.validate.isInvalid(row.entity,col.colDef)}\" tooltip-html-unsafe=\"{{grid.validate.getFormattedErrors(row.entity,col.colDef)}}\" tooltip-enable=\"grid.validate.isInvalid(row.entity,col.colDef)\" tooltip-append-to-body=\"true\" tooltip-placement=\"top\" title=\"TOOLTIP\">{{COL_FIELD CUSTOM_FILTERS}}</div>");
  }]);
})(require("process"));
