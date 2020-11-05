
function addItemsToCart(prodId) {
    $.ajax({
        url: 'add-to-cart/' + prodId,
        method: 'get',
        success: (response) => {
            if (response.status) {
                let cnt = $('#cartCntBadge').html();
                cnt = parseInt(cnt) + 1;
                $('#cartCntBadge').html(cnt);
                $('#addToCartBtn_' + response.product_id).html('Add More');
                $('#addToCartBtn_' + response.product_id).addClass('btn-success');
            }
        }
    })
}


function updateCart(cartId, prodId, userId, count) {
    let quantity = parseInt(document.getElementById('cart_' + prodId).innerHTML);
    $.ajax({
        url: '/update-cart',
        data: {
            user: userId,
            cart: cartId,
            product: prodId,
            count: count,
            quantity: quantity
        },
        method: 'post',
        success: (response) => {
            if (response.removeProduct) {
                alert("Product Has been Removed");
                location.reload();
            }
            else {
                document.getElementById('cart_' + prodId).innerHTML = quantity + count;
                document.getElementById('cart_total').innerHTML = response.total;
            }
        }
    })
}

function removeItemFromCart(cartId, prodId) {
    $.ajax({
        url: '/remove-cart',
        data: {
            cart: cartId,
            product: prodId
        },
        method: 'post',
        success: (response) => {
                alert("Product Has been Removed");
                location.reload();
        }
    })
}