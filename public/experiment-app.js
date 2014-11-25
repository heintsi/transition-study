$(document).ready(function() {

  function easing() { return $el.controlPanel().find('.easing-radio:checked').attr('value') }
  function duration() {
    var $slider = $el.controlPanel().find('.slider-animation')
    return $slider.attr('max') - $slider.val()
  }

  var activityLog = []

  var $el = {
    app: function() { return $('body') },
    surveyState: function() { return $('.survey-state') },
    surveyContent: function() { return $('.survey-content') },
    controlPanel: function() { return $('.control-panel') }
  }

  function switchSurveyStateTo(stateName) {
    var stateIndex = _.findIndex(surveyStates, { name: stateName });
    surveyStates[stateIndex].render()
    logAnimationDurationsOnAdjust()
    logEasingOnChange()
    renderSurveyState()
    bindSurveyStateSwitchers()
    logActivity('state_switch')

    function renderSurveyState() {
      $el.surveyState().html(templatesObj['survey-state']({ currentStateNumber: stateIndex + 1, totalStatesCount: surveyStates.length }))
      $el.surveyState().data('stateId', stateName)
    }

    function bindSurveyStateSwitchers() {
      $el.surveyState().find('.previous-state-btn').click(function () {
        switchSurveyStateTo(getPreviousSurveyStateName())
      })
      $el.surveyState().find('.next-state-btn').click(function () {
        switchSurveyStateTo(getNextSurveyStateName())
      })
    }
  }

  function getSurveyState() { return $el.surveyState().data('stateId') }

  function getPreviousSurveyStateName() { return surveyStates[Math.max(0, _.findIndex(surveyStates, { name: getSurveyState() }) - 1)].name }
  function getNextSurveyStateName()     { return surveyStates[Math.min(surveyStates.length - 1, _.findIndex(surveyStates, { name: getSurveyState() }) + 1)].name }

  var surveyStates = [
    { name: 'modalSurvey',        render: renderImageModalSurvey },
    { name: 'insertionSurvey',    render: renderInsertionSurvey },
    { name: 'browseSurvey',       render: renderBrowseSurvey },
    { name: 'screenChangeSurvey', render: renderScreenChangeSurvey }
  ]

  switchSurveyStateTo('modalSurvey')

  function renderImageModalSurvey() {
    renderControlPanel({
      taskHeader: 'Kuvan avaaminen suureksi',
      taskDescription: 'Klikkaa oikealla olevaa kuvaa, jolloin kuva avautuu suuremmaksi. Säädä animaatio sopivaksi.',
      functionalityDescription: 'Animaation nopeus',
      sliderType: 'modal'
    })
    renderImageThumbnails()
    openImageModalOnClick()

    function openImageModalOnClick() {
      var modalBgOverlay = $el.app().find('.image-modal-bg-overlay'),
        imageModal = $el.surveyContent().find('.image-product__flying-thumbnail')
      $el.surveyContent().find('.image-product__thumbnail').click(function (e) {

        logActivity('modal_click', 'open')

        modalBgOverlay.velocity('fadeIn', {
          queue: false,
          duration: duration(),
          easing: easing()
        })
        imageModal.show()
          .velocity({
            scale: 5,
            top: '180px'
          }, {
            queue: false,
            display: 'block',
            duration: duration(),
            easing: easing()
          })

      })
      imageModal.click(function () {
        logActivity('modal_click', 'close')
        modalBgOverlay.velocity('fadeOut', {
          queue: false,
          duration: duration(),
          easing: easing()
        })
        imageModal
          .velocity({
            scale: 1,
            top: '0'
          }, {
            display: 'none',
            queue: false,
            duration: duration(),
            easing: easing()
          })
      })
    }
  }

  function renderInsertionSurvey() {
    renderControlPanel({
      taskHeader: 'Kuvan lisääminen kokoelmaan',
      taskDescription: 'Klikkaa oikealla olevaa kuvaa, jolloin kuva lisätään kokoelmaan. Säädä animaatio sopivaksi.',
      functionalityDescription: 'Animaation nopeus',
      sliderType: 'add'
    })
    renderContentArea('experiment_insertion')
    addImageToCollectionOnClick()

    function addImageToCollectionOnClick() {
      $el.surveyContent().find('.image-product__thumbnail').click(function () {
        if (!allowInteraction()) {
          return
        }

        $el.surveyContent().find('.image-product__flying-thumbnail.remove-me').remove()
        var $parent = $(this).closest('.image-product');
        var $flyingThumbnail = $parent.find('.image-product__flying-thumbnail').first()
        $parent.append($flyingThumbnail.clone())
        $flyingThumbnail.show()
        var $cart = $el.surveyContent().find('.image-collection')
        var diffX = $cart.get(0).getBoundingClientRect().left - $flyingThumbnail.get(0).getBoundingClientRect().left + 20
        var diffY = $cart.get(0).getBoundingClientRect().top - $flyingThumbnail.get(0).getBoundingClientRect().top + 100

        logActivity('add_click')

        disableInteraction()

        $flyingThumbnail
          .velocity('fadeIn', {
            easing: 'easeOutQuart',
            queue: false,
            duration: duration()
          })
          .velocity({
            translateX: diffX + 'px',
            translateY: diffY + 'px'
          }, {
            easing: easing(),
            queue: false,
            duration: duration(),
            complete: function() { $flyingThumbnail.addClass('remove-me'); enableInteraction() }
          })

      })

    }
  }

  function renderBrowseSurvey() {
    renderControlPanel({
      taskHeader: 'Kuvien selaaminen',
      taskDescription: 'Selaa kuvia klikkaamalla nuolipainikkeita. Säädä animaatio sopivaksi.',
      functionalityDescription: 'Animaation nopeus',
      sliderType: 'browse'
    })
    $el.surveyContent().html(templatesObj['experiment_browse']({
      startImgSrc: 'images/img02.jpg',
      leftImgSrc: 'images/img01.jpg',
      rightImgSrc: 'images/img03.jpg'
    }))
    changeImageOnClick()

    function changeImageOnClick() {
      $el.surveyContent().find('.browse-left').click(function() { changeCenterImage(true) })
      $el.surveyContent().find('.browse-right').click(function () { changeCenterImage(false) })

      function changeCenterImage(goLeft) {
        if(!allowInteraction()) return

        logActivity('browse ' + (goLeft? 'left' : 'right') + ' click')
        disableInteraction()

        var imageBoxToSwitchToClass = goLeft? 'image-box-left' : 'image-box-right',
            imageBoxToReplaceClass = goLeft? 'image-box-right' : 'image-box-left'

        $el.surveyContent().find('.' + imageBoxToSwitchToClass)
          .velocity({
            left: '0'
          }, {
            queue: false,
            duration: duration(),
            easing: easing(),
            complete: function() {
              $(this).removeClass(imageBoxToSwitchToClass).addClass('image-box-current').attr('style', '')

            }
          })

        $el.surveyContent().find('.image-box-current')
          .velocity({
            left: goLeft? '480px' : '-480px'
          }, {
            queue: false,
            duration: duration(),
            easing: easing(),
            complete: function() {
              $(this).removeClass('image-box-current').addClass(imageBoxToReplaceClass).attr('style', '')
              enableInteraction()
            }
          })

        $el.surveyContent().find('.' + imageBoxToReplaceClass).removeClass(imageBoxToReplaceClass).addClass(imageBoxToSwitchToClass)

      }
    }
  }

  function renderScreenChangeSurvey() {

  }

  function renderControlPanel(context) {
    $el.controlPanel().html(templatesObj['control-panel'](context))
  }

  function renderContentArea(templateName) {
    $el.surveyContent().html(templatesObj[templateName]({
      images: _.map(_.range(1,2), function(num) {
        return {
          imageSrc: 'images/img0' + num + '.jpg'
        }
      })
    }))
  }

  function renderImageThumbnails() {
    var context = {
      images: _.map(_.range(2,3), function(num) {
        return {
          imageSrc: 'images/img0' + num + '.jpg'
        }
      })
    }
    $el.surveyContent().html(templatesObj['experiment_image-modal'](context))
  }

  function logAnimationDurationsOnAdjust() {
    $el.controlPanel().find('.slider-animation').change(_.throttle(function() {
      logActivity('anim_change', duration())
    }, 200))
  }

  function logEasingOnChange() {
    $el.controlPanel().find('.easing-radio').click(function() {
      logActivity('easing_change', easing())
    })
  }

  function logActivity(msg, value) {
    activityLog.push({
      timestamp: new Date().getTime(),
      state: getSurveyState(),
      msg: msg,
      val: value || 'N/A'
    })
  }

  var _allowInteraction = true

  function allowInteraction() {
    return _allowInteraction
  }

  function disableInteraction() {
    _allowInteraction = false
  }

  function enableInteraction() {
    _allowInteraction = true
  }

  $el.surveyState().click(function() {
    console.log('LOG ENTRIES:')
    _.forEach(activityLog, function(entry) { console.log(entry) })
  })

  })