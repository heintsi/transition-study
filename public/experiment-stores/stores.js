$(document).ready(function () {

  console.log('Alive and kicking!')

  var durations = {
    modal: 1000,
    cart: 1000,
    newimage: 1000
  }

  function modalDuration() {
    return durations.modal
  }

  function cartDuration() {
    return durations.cart
  }


  $('.image-product').hover(function() {
    $(this).find('.image-overlay').toggle()
  })

  var $app = $('body')

  putItemToCartOnAddClick()

  function putItemToCartOnAddClick() {
    $app.find('.add-to-cart-btn').click(function () {
      var $parent = $(this).closest('.image-product');
      var $flyingThumbnail = $parent.find('.image-product__flying-thumbnail').first()
      $parent.append($flyingThumbnail.clone())
      var $cart = $app.find('.cart')
      var $storage = $cart.find('.storage');
      $storage.append($flyingThumbnail.clone())
      $flyingThumbnail.show()
      var diffX = $cart.get(0).getBoundingClientRect().left - $flyingThumbnail.get(0).getBoundingClientRect().left
      var diffY = $cart.get(0).getBoundingClientRect().top - $flyingThumbnail.get(0).getBoundingClientRect().top
      $flyingThumbnail
        .velocity('fadeOut', {
          easing: 'easeOutQuart',
          queue: false,
          duration: cartDuration(),
          complete: function() {
            $cart.find('.counter').text($storage.children().length)
            $flyingThumbnail.remove()
          }
        })
        .velocity({
          translateX: diffX + 'px',
          translateY: diffY + 'px'
        }, {
          queue: false,
          duration: cartDuration(),
          easing: 'easeOutCubic',
        })
    })
  }

})