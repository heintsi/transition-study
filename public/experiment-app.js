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
    changeAnimationDurationsOnAdjust()
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
    { name: 'deletionSurvey',     render: renderDeletionSurvey },
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
        imageModal = $el.app().find('.image-product__flying-thumbnail')
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
    renderContentArea()
    addImageToCollectionOnClick()

    function addImageToCollectionOnClick() {

    }
  }

  function renderDeletionSurvey() {

  }

  function renderScreenChangeSurvey() {

  }

  function renderControlPanel(context) {
    $el.controlPanel().html(templatesObj['control-panel'](context))
  }

  function renderContentArea(templateName) {

  }

  function renderImageThumbnails() {
    var context = {
      images: _.map(_.range(1,2), function(num) {
        return {
          imageSrc: 'images/img0' + num + '.jpg'
        }
      })
    }
    $el.surveyContent().html(templatesObj['experiment_image-modal'](context))
  }

  function changeAnimationDurationsOnAdjust() {
    $el.controlPanel().find('.slider-animation').change(_.throttle(function() {
      logActivity('anim_change', duration())
    }, 200))
  }

  function logActivity(msg, value) {
    activityLog.push({
      timestamp: new Date().getTime(),
      state: getSurveyState(),
      msg: msg,
      val: value
    })
  }

  $el.surveyState().click(function() {
    console.log('LOG ENTRIES:')
    _.forEach(activityLog, function(entry) { console.log(entry) })
  })

  })