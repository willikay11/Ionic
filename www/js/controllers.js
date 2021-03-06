angular.module('songhop.controllers', ['ionic', 'songhop.services'])


/*
Controller for the discover page
*/
.controller('DiscoverCtrl', function($scope, $timeout, User, $ionicLoading, Recommendations) {
    
    var showLoading =  function () {
        $ionicLoading.show({
            template: '<i class="ion-loading-c"></i>',
            noBackdrop: true
        })
    };

    var hideLoading = function () {
        $ionicLoading.hide();
    };

    showLoading();
    
    Recommendations.init()
        .then(function () {
            $scope.currentSong = Recommendations.queue[0];

            return Recommendations.playCurrentSong();
        }).then(function () {

            hideLoading();

            $scope.currentSong.loaded = true;
        });

    $scope.sendFeedback = function (bool) {

        if(bool) User.addSongToFavorites($scope.currentSong);

        $scope.currentSong.rated = bool;

        $scope.currentSong.hide = true;

        Recommendations.nextSong();

        $timeout(function () {
            $scope.currentSong = Recommendations.queue[0];
        }, 250);

        Recommendations.playCurrentSong().then(function () {
            $scope.currentSong.loaded = true;
        });
    };

    $scope.nextAlbumImg = function () {
        if(Recommendations.queue.length > 1)
        {
            return Recommendations.queue[1].image_large;
        }
    };
})


/*
Controller for the favorites page
*/
.controller('FavoritesCtrl', function($scope, User, $window) {

    $scope.favorites = User.favorites;

    $scope.removeSong = function (song, index) {
        User.removeSongFromFavorites(song, index);
    };

    $scope.openSong = function (song) {
        $window.open(song.open_url, "_system");
    };

    $scope.username = User.username;
})


/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope, Recommendations, User, $window) {

    $scope.favCount = User.favoriteCount;

    //stop audio when going to favorites page
    $scope.enteringFavorites = function () {
        User.newFavorites = 0;
        Recommendations.haltAudio();
    };

    $scope.leavingFavorites = function () {
        Recommendations.init();
    };

    $scope.logout = function() {
        User.destroySession();

        // instead of using $state.go, we're going to redirect.
        // reason: we need to ensure views aren't cached.
        $window.location.href = 'index.html';
    };
})

/*
Controller for our splash Screen
 */
.controller('SplashCtrl', function ($scope, $state, User) {

    $scope.submitForm = function (username, signingUp) {
        User.auth(username, signingUp)
            .then(function () {
                $state.go('tab.discover')
            }, function () {
                alert('try another username.');
            });
    }
});