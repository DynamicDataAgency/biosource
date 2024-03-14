window.addEventListener("load", function() {

    var locationRedirect = "";
    function __init(){
             var env = jQuery(jQuery('[data-hc-url]')).attr('data-hc-url');
             env = env ? env : 'https://checkout.myhostedcheckout.com/';
             var checkoutURL = env+'app/slug='+window.location.host;
             var butItNow=jQuery("[data-hc-buy-it-now]");
             if(butItNow && butItNow.attr('data-remove-default-buy-it')){
                 jQuery('head').append('<style type="text/css">[type=button][data-testid=Checkout-button]{display:none !important;}</style>');
             }
 
             function billingLabelInCartinfo(){
                 try{
                     let offers = JSON.parse(window.localStorage.getItem('offers'));
                     if(!offers){
                         return 0;
                     }
 
                     jQuery('[data-offer-detail]').each(function(){
                         let data_cart_item_key = jQuery(jQuery(this).closest('[data-cart-item-key]')).attr('data-cart-item-key');
                         let variant_label = '';
 
                         if(data_cart_item_key){
                             let variant = data_cart_item_key.split(':');
                             variant = variant ? variant[0] : '';
                             Object.values(offers).map(function(tempVal){
                                 let indexVal = tempVal.variant_id.indexOf(variant.toString());
                                     variant_label = indexVal>-1 && tempVal.billing_label.length >= indexVal ? tempVal.billing_label[indexVal] : variant_label;
                             });
                         }
 
                         if(variant_label){
                             jQuery(this).html(variant_label);
                         }
                     });
                 }catch(e){
                     console.log("Error:",e);
                 }
             }
             billingLabelInCartinfo();
             butItNow.click(function(e){
                 try{
                     e.stopPropagation();
                     e.preventDefault();
 
                     let product = JSON.parse(jQuery("#ProductJson-product-template").text());
                     if(!product){
                         return 0;
                     }
                     let variant = jQuery("#ProductSelect-product-template").val();
                     variant = variant ? variant :null;
                     let crm_billing_model_id = jQuery("[name=crm_billing_model]").val();
 
                     let routeUrl = checkoutURL+"&products="+product.id+"&quantity=1&variant="+variant+(crm_billing_model_id?"&billing_id="+crm_billing_model_id : "");
                     window.location = routeUrl;
                 }catch(e){
                     console.log("Error:",e);
                 }
             });
 
             jQuery("[data-add-to-cart]").click(function(t) {
                 try{
                     let product = JSON.parse(jQuery("#ProductJson-product-template").text());
                     if(!product){
                         return 0;
                     }
 
                     let offers = JSON.parse(window.localStorage.getItem('offers'));
                     offers = offers ?offers :{};
                     let variant = jQuery("#ProductSelect-product-template").val();
                     variant = variant ? variant :null;
                     let crm_billing_model_id = jQuery("[name=crm_billing_model]").val();
                     let crm_billing_model_label = jQuery("[name=crm_billing_model] option:selected").html()
                     let offer ={};
                     
                     if(offers && product.id in offers){ 
                         offer = offers[product.id];
                         
                     }else{
                         offer = {prodcut_id:product.id, variant_id:[], billing_id:[],billing_label:[]};
                     }
                     
                 let v_index = offer.variant_id.indexOf(variant);
                 if( v_index >-1 ){
                     offer.variant_id.splice(v_index,1);
                     offer.billing_id.splice(v_index,1);
                     offer.billing_label.splice(v_index,1);
                 }
                 
                 //   if(!crm_billing_model_id){
                 //     return true;
                 //   }
 
                 offer.variant_id.push(variant);
                 offer.billing_id.push(crm_billing_model_id);
                 offer.billing_label.push(crm_billing_model_label);
                 
                 offers[product.id] = offer;
                 window.localStorage.setItem("offers", JSON.stringify(offers));
                     
                 }catch(e){
                     console.log("Error",e);
                 }
             });
 
             var billingModelIds = [];
             //for checkout process
             function getBillingIds(prodcutId,variant){
                 try{
                     let billing_id = 0;
                     let offers = JSON.parse(window.localStorage.getItem('offers'));
                     let offer = prodcutId in offers ? offers[prodcutId] : {}; 
                     let v_index = offer && 'variant_id' in offer && offer.variant_id.indexOf(variant.toString()) >-1 ? offer.variant_id.indexOf(variant.toString()) : -1;
                     billing_id = v_index > -1 && 'billing_id' in offer && offer.billing_id[v_index] ? offer.billing_id[v_index] : billing_id;
 
                     if(prodcutId in billingModelIds){
                         billingModelIds[prodcutId] = billingModelIds[prodcutId].toString()+"-"+billing_id.toString();
                     }else{
                         billingModelIds[prodcutId] = billing_id.toString();
                     }
                 
                 }catch(e){
                     console.log("Error",e);
                 }
             }
 
             jQuery("[name=checkout]").click(function(t) {
                 try{

                    t.preventDefault(), 
                    jQuery(this).prop('disabled', true);
                    $.get("/cart.json", function(t) {
                        var o = [],
                            n = [],
                            e = [];
						//console.log(t); 
						//return false;

                        for (i = 0; i < t.items.length; i++) o.indexOf(t.items[i].product_id) < 0 && o.push(t.items[i].product_id), n[i] = t.items[i].quantity, t.items[i].product_id in e ? e[t.items[i].product_id] = e[t.items[i].product_id].toString() + "-" + t.items[i].variant_id.toString() : e[t.items[i].product_id] = t.items[i].variant_id.toString(), getBillingIds(t.items[i].product_id , t.items[i].variant_id);
                        e = Object.values(e); billingModelIds=Object.values(billingModelIds);
                        let hash =  "&products=" + o.join() + "&quantity=" + n.join();
                        e.length > 0 && (hash += "&variant=" + e.join()); billingModelIds.length > 0 && (hash += "&billing_id=" + billingModelIds.join());
                        let d = checkoutURL  + hash;
                        locationRedirect = d;

                        //add refersion coupon
                        let ref_coupon = window.localStorage.getItem("ref_coupon");
                        if(ref_coupon){
                            locationRedirect = locationRedirect + "&coupon_code_e="+ref_coupon
                        }
                        validateSubscription(hash);
                        //  window.location = d
                    })
                 }catch(e){
                    jQuery(this).prop('disabled', false);
                 }
                 
             })

             function validateSubscription(hashStr){
                 try{
                    //checkoutURL 
                    let apiUrl = '';
                    
                    jQuery('script').map(function(){
                        let srcStr = jQuery(this).attr('src');

                        if(srcStr && srcStr.indexOf('hc-sdk.js')>-1){
                            apiUrl = srcStr
                        }
                    });

                    let pathArray = apiUrl.split( '/' );
                    apiUrl = pathArray[0]+'//'+pathArray[2]
                    
                    $.ajax(
                        {
                            //url:apiUrl+'/get-product-subscription',
							url:'',
                            type:'post',
                            headers:{

                            },
                            data:{
                                "X-LL-Hash":'slug='+window.location.host+hashStr
                            },
                            dataType:'json',
                            success: function(data){
                                console.log(data, "data");
                                let productDetail = false; //data && 'products' in data && Object.values(data.products).find(elm=> {'subscription_status' in elm && elm.subscription_status == true } )

                                data && 'products' in data && Object.values(data.products).map(function(val){
                                    if(productDetail!=true){
                                        productDetail = ('subscription_status' in val && val.subscription_status == true ? true: false)
                                    }
                                });


                                let checkout_enable_redirect_subscription = 'checkout_enable_redirect_subscription' in data && data.checkout_enable_redirect_subscription ? data.checkout_enable_redirect_subscription : false;  
                                if( (checkout_enable_redirect_subscription== true && productDetail == true) || checkout_enable_redirect_subscription!=true ){
                                    window.location = locationRedirect;
                                }else{
                                    window.location = '/checkout';
                                }
                            }
                        });

                 }catch(e){
                     window.location = locationRedirect;
                 }
             }
 
             function checkoutSuccess(){
                 try{
                     let urlParams = new URLSearchParams(window.location.search);
                     let action = urlParams.get('action');
                     if(action == 'order_success'){
                         (jQuery).ajax({url: "/cart/clear", success: function(result){
                             window.location.href= window.location.origin;
                         }});
                     }
                 }catch(e){
                     console.log("Error",e);
                 }
             }


             //param filter
             function getParameterByName(name, url) {
                if (!url) url = window.location.href;
                name = name.replace(/[\[\]]/g, '\\$&');
                var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
                    results = regex.exec(url);
                if (!results) return null;
                if (!results[2]) return '';
                return decodeURIComponent(results[2].replace(/\+/g, ' '));
            }

            function manageAFCouponOnLocal(){
                try{
                    let coupon = getParameterByName("coupon");
                    coupon = coupon ? coupon : getParameterByName("coupon_code");
                    coupon = coupon ? coupon : getParameterByName("couponCode");
                    if(!coupon) return false;

                    window.localStorage.setItem("ref_coupon",coupon);
                
                }catch(e){
                    console.log("Error",e);
                }
            }
            
            checkoutSuccess();
            manageAFCouponOnLocal();
    }
 
    if(typeof(jQuery) === "undefined"){
         var script = document.createElement('script');
         script.type = "text/javascript";
         if(script.readyState) {  // only required for IE <9
             script.onreadystatechange = function() {
             if ( script.readyState === "loaded" || script.readyState === "complete" ) {
                 script.onreadystatechange = null;
                 __init();
             }
             };
         } else {  //Others
             script.onload = function() {
                 __init();
             };
         }
 
         script.src = "https://code.jquery.com/jquery-3.5.1.min.js";
 
         document.head.appendChild(script);
     }else{
         __init()
     }
     
 });
