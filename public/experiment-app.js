$(document).ready(function() {
  console.log('Alive and kicking!')

  var durations = {
    modal: 1000
  }

  var easing = function() { return $el.controlPanel().find('.easing-radio:checked').attr('value') }

  var activityLog = ['first-entry']

  var $el = {
    app: function() { return $('body') },
    surveyState: function() { return $('.survey-state') },
    surveyContent: function() { return $('.survey-content') },
    controlPanel: function() { return $('.control-panel') }
  }

  renderImageModalSurvey()

  function renderImageModalSurvey() {
    renderControlPanel({
      taskHeader: 'Kuvan avaaminen suureksi',
      taskDescription: 'Klikkaa oikealla olevaa kuvaa, jolloin kuva avautuu suuremmaksi. Säädä animaatio sopivaksi.',
      functionalityDescription: 'Animaation nopeus',
      sliderType: 'modal'
    })
    renderImageThumbnails()
    openImageModalOnClick()
    changeAnimationDurationsOnAdjust()
  }

  function renderControlPanel(context) {
    $el.controlPanel().html(templatesObj['control-panel'](context))
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

  function openImageModalOnClick() {
    var modalBgOverlay = $el.app().find('.image-modal-bg-overlay'),
      imageModal = $el.app().find('.image-product__flying-thumbnail')
    $el.surveyContent().find('.image-product__thumbnail').click(function(e) {

      logActivity('modal clicked', 'open')

      modalBgOverlay.velocity('fadeIn', {
        queue: false,
        duration: modalDuration(),
        easing: easing()
      })
      imageModal.show()
        .velocity({
          scale: 5,
          top: '180px'
        }, {
          queue: false,
          display: 'block',
          duration: modalDuration(),
          easing: easing()
        })

    })
    imageModal.click(function () {
      logActivity('modal clicked', 'close')
      modalBgOverlay.velocity('fadeOut', {
        queue: false,
        duration: modalDuration(),
        easing: easing()
      })
      imageModal
        .velocity({
          scale: 1,
          top: '0'
        }, {
          display: 'none',
          queue: false,
          duration: modalDuration(),
          easing: easing()
        })
    })
  }

  function modalDuration() {
    return durations.modal
  }

  function animDuration(type) {
    return durations[type]
  }

  function changeAnimationDurationsOnAdjust() {
    $el.app().find('.control-panel .slider-animation')
    var $slider = $el.app().find('.control-panel .slider-animation')
    var sliderType = $slider.attr('name')
    $slider.val(animDuration(sliderType))
    $slider.change(_.throttle(function() {
      var sliderVal = 2000 - $slider.val() // is this perhaps more intuitive?
      durations[sliderType] = Number(sliderVal)
      logActivity('animation value changed to', sliderVal)
    }, 200))

  }

  function logActivity(msg, value) {
    activityLog.push({
      timestamp: new Date().getTime(),
      message: msg,
      value: value
    })
  }

  $el.surveyState().click(function() {
    console.log('LOG ENTRIES:')
    _.forEach(activityLog, function(entry) { console.log(entry) })
  })

  })