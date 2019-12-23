$(document).ready(function(e){
	$(".key").on("click",function(){
		var $theValue=$(this).attr("rel");
		$("input#pin").val($("input#pin").val()+$theValue);
		//alert($("input#pin").val());
		//alert($theValue);
	});
});
