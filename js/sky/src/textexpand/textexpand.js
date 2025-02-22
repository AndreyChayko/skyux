/*jslint plusplus: true */

/*global angular */

/** @module Text Expand
@icon text-height
@summary The text expand component truncates long text with an ellipsis and a link that users can click to expand the text.
 @description The texteExpand directive truncates long text with an ellipsis and a link that allows the user to fully expand the text. If the text length falls below the specified threshold then no action is taken.

Note that collapsed text will have newlines removed. Also, if one or more newlines are detected, the text is automatically collapsed regardless of the total length of the text.

### Text Expand Settings ###

 - `bb-text-expand` The text to truncate.
 - `bb-text-expand-max-length` *(Default: 200)* The number of characters to show before truncating the text. The directive will attempt to look back up to 10 characters for a space and truncate there in order to avoid truncating in the middle of a word.

The Text Expand Repeater directive truncates a list of repeater items and will initially display a set number of items. Any items over the set maximum limit are hidden until the user elects to expand the list.

### Text Expand Repeater Settings ###

- `bb-text-expand-repeater-max` The maximum number of items to show before truncating the repeater list.
- `bb-text-expand-repeater-data` The name of the property containing the repeater data.
 */

(function () {
    'use strict';

    var modules = [
            'sky.resources',
            'sky.scrollintoview'
        ];

    function getNewlineCount(value) {
        var matches = value.match(/\n/gi);

        if (matches) {
            return matches.length;
        }

        return 0;
    }

    angular.module('sky.textexpand', modules)
        .directive('bbTextExpandRepeater', ['bbResources', function (bbResources) {
            function link(scope, el, attrs) {
                scope.$watch(attrs.bbTextExpandRepeaterData, function (data) {
                    var length,
                        maxToShow,
                        seeMoreEl,
                        seeMoreText = bbResources.text_expand_see_more,
                        seeLessText = bbResources.text_expand_see_less;

                    if (data) {
                        length = data.length;
                        maxToShow = +attrs.bbTextExpandRepeaterMax;
                        seeMoreEl = angular.element('<a class="bb-text-expand-see-more">' + seeMoreText + '</a>');

                        if (length > maxToShow) {
                            el.find('li:gt(' + (maxToShow - 1) + ')').addClass('bb-text-expand-toggle-li').hide().end().append(
                                seeMoreEl.click(function () {
                                    seeMoreEl.siblings('.bb-text-expand-toggle-li').toggle(100);
                                    if (seeMoreEl.hasClass('bb-text-expand-see-more')) {
                                        seeMoreEl.text(seeLessText);
                                    } else {
                                        seeMoreEl.text(seeMoreText);
                                    }

                                    seeMoreEl.toggleClass('bb-text-expand-see-more');
                                })
                            );
                        }
                    }
                });
            }

            return {
                link: link
            };
        }])
        .directive('bbTextExpand', ['bbResources', 'bbScrollIntoView', function (bbResources, bbScrollIntoView) {
            function link(scope, el, attrs) {
                var isExpanded,
                    maxLength = +attrs.bbTextExpandMaxLength || 200,
                    maxExpandedLength = +attrs.bbTextExpandMaxExpandedLength || 6500,
                    maxNewlines = 1,
                    maxExpandedNewlines = 50;

                function getTruncatedText(value, length, newlines) {
                    var i;

                    if (newlines && getNewlineCount(value) >= newlines) {
                        value = value.replace(/\s+/gi, ' ');
                    }

                    // Jump ahead one character and see if it's a space, and if it isn't,
                    // back up to the first space and break there so a word doesn't get cut
                    // in half.
                    for (i = length; i > length - 10; i--) {
                        if (/\s/.test(value.charAt(i))) {
                            length = i;
                            break;
                        }
                    }

                    return value.substr(0, length);
                }

                scope.$watch(attrs.bbTextExpand, function (newValue) {
                    var collapsedText,
                        expandedText,
                        containerEl,
                        currentHeight,
                        ellipsisEl,
                        expandEl,
                        newHeight,
                        textEl,
                        spaceEl;

                    function animateText(previousText, newText, newExpandText, showEllipsis) {
                        // Measure the current height so we can animate from it.
                        currentHeight = containerEl.height();

                        expandEl.text(newExpandText);
                        textEl.text(newText);

                        newHeight = containerEl.height();

                        if (newHeight < currentHeight) {
                            // The new text is smaller than the old text, so put the old text back before doing
                            // the collapse animation to avoid showing a big chunk of whitespace.
                            textEl.text(previousText);
                        }

                        ellipsisEl.text(showEllipsis ? '...' : '');

                        containerEl
                            .height(currentHeight)
                            .animate(
                                {
                                    height: newHeight
                                },
                                250,
                                function () {
                                    if (newHeight < currentHeight) {
                                        textEl.text(newText);
                                    }
                                    containerEl.css('height', 'auto');
                                }
                            );
                    }

                    containerEl = angular.element('<div></div>');

                    /* istanbul ignore else: nothing happens when there's no value, so there's nothing to test. */
                    if (newValue) {
                        collapsedText = getTruncatedText(newValue, maxLength, maxNewlines);
                        expandedText = getTruncatedText(newValue, maxExpandedLength, maxExpandedNewlines); // Get text based on max expanded length

                        if (collapsedText !== newValue) {
                            isExpanded = true;

                            textEl = angular.element('<span class="bb-text-expand-text"></span>');
                            textEl.text(collapsedText);

                            ellipsisEl = angular.element('<span class="bb-text-expand-ellipsis">...</span>');

                            spaceEl = angular.element('<span class="bb-text-expand-space"> </span>');

                            expandEl = angular.element('<a href="#" class="bb-text-expand-see-more"></a>');
                            expandEl.text(bbResources.text_expand_see_more);

                            containerEl
                                .empty()
                                .append(textEl)
                                .append(ellipsisEl)
                                .append(spaceEl)
                                .append(expandEl);

                            expandEl.on('click', function () {
                                if (isExpanded) {
                                    animateText(collapsedText, expandedText, bbResources.text_expand_see_less, (expandedText !== newValue));
                                } else {
                                    animateText(expandedText, collapsedText, bbResources.text_expand_see_more, true);
                                }

                                bbScrollIntoView(expandEl);
                                isExpanded = !isExpanded;

                                return false;
                            });
                        } else {
                            containerEl.text(newValue);
                        }
                    }

                    el.empty().append(containerEl);

                    /* istanbul ignore next: these internal variables can't be tested. */
                    el.on('$destroy', function () {
                        containerEl = null;
                        expandEl = null;
                        textEl = null;
                        spaceEl = null;
                    });
                });
            }

            return {
                link: link
            };
        }]);
}());
