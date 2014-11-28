$(document).ready(function() {

  function easing() { return $el.controlPanel().find('.easing-radio:checked').attr('value') }
  function duration() {
    var $slider = $el.controlPanel().find('.slider-animation')
    return $slider.attr('max') - $slider.val()
  }

  var maxDuration = 2000

  var easingValues = {
    linear: 'linear',
    easeIn: 'easeInQuart',
    easeOut: 'easeOutQuart'
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
    surveyStates[stateIndex].render(surveyStates[stateIndex].animationSettings)
    logAnimationDurationsOnAdjust()
    logEasingOnChange()
    renderSurveyState()
    bindSurveyStateSwitchers()
    logActivity('state_switch')

    function renderSurveyState() {
      $el.surveyState().html(templatesObj['survey-state']({
        noPrevious: stateIndex == 0,
        noNext: stateIndex === surveyStates.length - 1,
        currentStateNumber: stateIndex + 1,
        totalStatesCount: surveyStates.length
      }))
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

  function getCurrentSurveyStateName() { return $el.surveyState().data('stateId') }

  function getPreviousSurveyStateName() { return surveyStates[Math.max(0, _.findIndex(surveyStates, { name: getCurrentSurveyStateName() }) - 1)].name }
  function getNextSurveyStateName()     { return surveyStates[Math.min(surveyStates.length - 1, _.findIndex(surveyStates, { name: getCurrentSurveyStateName() }) + 1)].name }

  var surveyStates = [
    {
      name: 'modalSurvey',
      render: renderImageModalSurvey,
      animationSettings: {
        duration: maxDuration/2,
        easing: easingValues.linear
      }
    },
    {
      name: 'insertionSurvey',
      render: renderInsertionSurvey,
      animationSettings: {
        duration: maxDuration/2,
        easing: easingValues.linear
      }
    },
    {
      name: 'browseSurvey',
      render: renderBrowseSurvey,
      animationSettings: {
        duration: maxDuration/2,
        easing: easingValues.linear
      }
    },
    {
      name: 'endSurvey',
      render: renderEndSurvey,
      animationSettings: {}
    }
    //{ name: 'screenChangeSurvey', render: renderScreenChangeSurvey }
  ]

  switchSurveyStateTo('modalSurvey')

  function renderImageModalSurvey(animationSettings) {
    renderControlPanel({
      taskHeader: 'Kuvan avaaminen suureksi',
      taskDescription: 'Klikkaa oikealla olevaa kuvaa, jolloin kuva avautuu suuremmaksi. Säädä animaatio mieluisaksi.',
      functionalityDescription: 'Animaation nopeus',
      sliderType: 'modal',
      startingSpeed: maxDuration - animationSettings.duration,
      startingEasing: {
        linear: animationSettings.easing === easingValues.linear,
        easeIn: animationSettings.easing === easingValues.easeIn,
        easeOut: animationSettings.easing === easingValues.easeOut
      },
      maxDuration: maxDuration
    })
    $el.surveyContent().html(templatesObj['experiment_image-modal']({
      images: [{
        imageSrc: 'images/img01.jpg'
        }]
    }))
    openImageModalOnClick()

    function openImageModalOnClick() {
      var imageModal = $el.surveyContent().find('.image-product__flying-thumbnail')
      $el.surveyContent().find('.image-product__thumbnail').click(function (e) {
        if(!allowInteraction()) return
        logActivity('modal_click', 'open')
        disableInteraction()
        imageModal.show()
          .velocity({
            scale: 4,
            top: '170px'
          }, {
            queue: false,
            display: 'block',
            duration: duration(),
            easing: easing(),
            complete: function() { enableInteraction() }
          })

      })
      imageModal.click(function () {
        if(!allowInteraction()) return
        logActivity('modal_click', 'close')
        disableInteraction()
        imageModal
          .velocity({
            scale: 1,
            top: '0'
          }, {
            display: 'none',
            queue: false,
            duration: duration(),
            easing: easing(),
            complete: function() { enableInteraction() }
          })
      })
    }
  }

  function renderInsertionSurvey(animationSettings) {
    renderControlPanel({
      taskHeader: 'Kuvan lisääminen kokoelmaan',
      taskDescription: 'Klikkaa oikealla olevaa kuvaa, jolloin kuva "lisätään kokoelmaan". Säädä animaatio mieluisaksi.',
      functionalityDescription: 'Animaation nopeus',
      sliderType: 'add',
      startingSpeed: maxDuration - animationSettings.duration,
      startingEasing: {
        linear: animationSettings.easing === easingValues.linear,
        easeIn: animationSettings.easing === easingValues.easeIn,
        easeOut: animationSettings.easing === easingValues.easeOut
      },
      maxDuration: maxDuration
    })
    $el.surveyContent().html(templatesObj['experiment_insertion']({
      images: [{
        imageSrc: 'images/img02.jpg'
      }]
    }))

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

        var $addedCount = $cart.find('.added-count')

        logActivity('add_click')

        disableInteraction()

        $flyingThumbnail
          .velocity('fadeOut', {
            easing: 'easeInQuart',
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
            complete: function() {
              $flyingThumbnail.addClass('remove-me')
              var count = Number($addedCount.text())
              $addedCount.text(count+1)
              enableInteraction() }
          })

      })

    }
  }

  function renderBrowseSurvey(animationSettings) {
    renderControlPanel({
      taskHeader: 'Kuvien selaaminen',
      taskDescription: 'Selaa kuvia klikkaamalla nuolipainikkeita. Säädä animaatio mieluisaksi.',
      functionalityDescription: 'Animaation nopeus',
      sliderType: 'browse',
      startingSpeed: maxDuration - animationSettings.duration,
      startingEasing: {
        linear: animationSettings.easing === easingValues.linear,
        easeIn: animationSettings.easing === easingValues.easeIn,
        easeOut: animationSettings.easing === easingValues.easeOut
      },
      maxDuration: maxDuration
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

        logActivity('browse_' + (goLeft? 'left' : 'right'))
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

  function renderEndSurvey() {
    $el.controlPanel().html('')
    $el.surveyContent().html(templatesObj['end'])
    $el.surveyContent().find('.submit-survey-btn').click(saveActivities)
  }

  function renderControlPanel(context) {
    context = _.assign({}, context, {
      easingLinear: easingValues.linear,
      easingEaseIn: easingValues.easeIn,
      easingEaseOut: easingValues.easeOut
    })
    $el.controlPanel().html(templatesObj['control-panel'](context))
  }

  function logAnimationDurationsOnAdjust() {
    $el.controlPanel().find('.slider-animation').change(_.throttle(function() {
      surveyStates[_.findIndex(surveyStates, { name: getCurrentSurveyStateName() })].animationSettings.duration = duration()
      logActivity('anim_change', duration())
    }, 200))
  }

  function logEasingOnChange() {
    $el.controlPanel().find('.easing-radio').click(function() {
      surveyStates[_.findIndex(surveyStates, { name: getCurrentSurveyStateName() })].animationSettings.easing = easing()
      logActivity('easing_change', easing())
    })
  }

  function logActivity(msg, value) {
    activityLog.push({
      timestamp: new Date().getTime(),
      state: getCurrentSurveyStateName(),
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

  function saveActivities() {
    $el.app().find('textarea.pic-scale').val(JSON.stringify(activityLog))
    $el.app().find('.forms-form').submit()
  }

  })