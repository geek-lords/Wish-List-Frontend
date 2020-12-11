// Global variables
var wishes_list = {};
var country_id;
var MAX_WISHES = 3;

window.addEventListener('load', function(){
    // Request list of countries with API from server
    //getCountries();
    // Define other functions of the page
    searchWish();
    selectWish();
    createWish();
    selectCountry();
    submitForm();
});

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

function addOption(id,optionText,optionValue){
    $('#'+id).append(`<option value="${optionValue}">${optionText}</option>`)
}

function validateMaxInputs(){
    console.log(wishes_list)
    if(Object.keys(wishes_list).length==MAX_WISHES){
        document.getElementById('submit-btn').style.display = 'block';
        document.getElementById('inp-search').disabled = true;
        document.getElementById('select-wish').disabled = true;
        document.getElementById('create-wish-inp').disabled = true;
        document.getElementById('create-wish-btn').disabled = true;
    }else{
        document.getElementById('submit-btn').style.display = 'none';
        document.getElementById('inp-search').disabled = false;
        document.getElementById('select-wish').disabled = false;
        document.getElementById('create-wish-inp').disabled = false;
        document.getElementById('create-wish-btn').disabled = false;
    }
    if(country_id==null){
        document.getElementById('submit-btn').style.display = 'none';
    }
}

function getCountries(){
    $.ajax({
        type: "GET",
        url: "/v1/countries",
        dataType: "json",
        success: function (data) {
            var countries = data.countries;
            for(i=0; i<countries.length; i++){
                addOption('select-country',countries[i].name , countries[i].id);
            }
        },
        error: function (jqXHR, status, err) {
          alert(status+":"+err);
        },
    });
}

function searchWish(){
    var search = document.getElementById('inp-search');
    var chooseDiv = document.getElementById('choose-div');
    search.addEventListener('keyup', function(){
        var val = search.value;
        if(isBlank(val)){
            search.value = null;
            chooseDiv.style.display = 'none';
        }else {
            chooseDiv.style.display = 'block';
            $('#select-wish').empty();
            $('#select-wish').append(`<option value="default" selected disabled>Choose amongst suggestions</option>`);
            // get wishes with API from server
                $.ajax({
                    type: "GET",
                    url: "/v1/wishes",
                    dataType: "json",
                    success: function (data) {
                        var wishes = data.wishes;
                        for(i=0; i<wishes.length; i++){
                            addOption('select-wish',wishes[i].name , wishes[i].id);
                        }
                    },
                    error: function (jqXHR, status, err) {
                      alert(status+":"+err);
                    },
                });
                
        }
    })
}

function selectWish(){
    var selectedWish = document.getElementById('select-wish');
    selectedWish.addEventListener('change', function(){
        var option_value = selectedWish.options[selectedWish.selectedIndex].value;
        var option_name = selectedWish.options[selectedWish.selectedIndex].innerHTML;
        if(option_value!='default'){
            createChip(option_name,option_value);
            validateMaxInputs();
        }
    });
}

function createChip(wish,id){
    wishes_list[id] = wish;
    console.log("Wishes list : " + wishes_list);
    var chip = document.getElementById('chip-div');
    chip.innerHTML += (`<div class="chip shadow-lg" id="${id}">${wish}<span class="closebtn" onclick="deleteWish(this)">&times;</span></div>`);
    chip.style.display = 'block';
}

function createWish(){
    var create_wish_input = document.getElementById('create-wish-inp');
    var create_wish_btn = document.getElementById('create-wish-btn');
    create_wish_btn.addEventListener('click', function(){
        var wish = create_wish_input.value;
        console.log("isBlank : "+ isBlank(create_wish_input.value));
        if(isBlank(create_wish_input.value)){
            create_wish_input.value = null;
            return;
        } else{
            $.ajax({
                type: "GET",
                url: "v1/createwish",
                data: JSON.stringify({"wish":wish}),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    createChip(wish, response.id)
                },
                error: function (jqXHR, status, err) {
                  alert(status+":"+err);
                },
            });
            validateMaxInputs();
        }
    })
}

function deleteWish(e){
    var id = e.parentElement.id;
    // Remove the element from the global list.
    console.log("ID of chip " + id);
    if(wishes_list.hasOwnProperty(id))
        delete wishes_list[id];
    console.log("Removed an element from the list : " + wishes_list);
    validateMaxInputs();
    e.parentElement.style.display='none';
}

function selectCountry(){
    var selected_country = document.getElementById('select-country');
    selected_country.addEventListener('change', function(){
        var country = selected_country.options[selected_country.selectedIndex].value;
        if(country!='default') country_id = country;
        if(Object.keys(wishes_list).length==MAX_WISHES && country_id!=null)
        document.getElementById('submit-btn').style.display = 'block';
        console.log("country chosen : " + country_id)
    })
}

function submitForm(){
    var submit = document.getElementById('submit-btn');
    submit.addEventListener('click', function(){
        console.log(country_id +  " " + wishes_list);
        var data = {"country_id" : country_id, "wishes" : wishes_list};
        $.ajax({
            type: "POST",
            url: "/v1/submit",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
            document.getElementById('left-div').innerHTML = 
            `<h1 class="self-align-center display-4" style="margin-top:40vh" >Your Response has been recorded</h1>
             <button>Check global results.</button>
            `;
            },
            error: function (jqXHR, status, err) {
              alert(status+":"+err);
            },
        });
    })
}