(function (THREE)
{
    /**
     * Vive Controllerを表示する
     */
    function ViveController(id)
    {
        THREE.Object3D.call(this);

        var scope = this;

        // Private members
        var _gamepad;

        // Public members
        this.axes = [0, 0];
        this.thumbpadIsPressed = false;
        this.triggerIsPressed = false;
        this.triggerValue = 0;
        this.gripsArePressed = false;
        this.menuIsPressed = false;
        this.sideButtonIsPressed = false;

        // ルームスケールのマトリクスを保持する
        // （コントローラの最終的な位置を決定するため）
        this.standingMatrix = new THREE.Matrix4();

        this.matrixAutoUpdate = false;

        // GamepadのGetter
        this.getGamepad = function ()
        {
            return _gamepad;
        }

        /**
         * ゲームパッドを見つける
         * （Viveの場合、コントローラが認識されていないとnullになる）
         */
        function findGamepad(id)
        {
            var gamepads = navigator.getGamepads();
            for (var i = 0, j = 0; i < 4; i++)
            {
                // 取得したゲームパッドの中から「OpenVR Gamepad」を探す
                var gamepad = gamepads[i];
                if (gamepad && gamepad.id === 'OpenVR Gamepad')
                {
                    if (j === id)
                    {
                        return gamepad;
                    }
                    j++;
                }
            }
        }

        this.update = function ()
        {
            gamepad = findGamepad(id);

            // ゲームパッドが無効な場合は非表示にするのみ
            if (gamepad === undefined || gamepad.pose === undefined)
            {
                scope.visible = false;
                return;
            }

            // ゲームパッドにposeがなければ終了
            if (gamepad.pose === null) { return; }


            // コントローラの制御
            var pose = gamepad.pose;
            if (pose.position !== null) { scope.position.fromArray(pose.position); }
            if (pose.orientation !== null) { scope.quaternion.fromArray(pose.orientation); }

            // デバイスからの情報を元に姿勢を更新し、ルームスケールのマトリクスを掛けて最終的な姿勢にする
            scope.matrix.compose(scope.position, scope.quaternion, scope.scale);
            scope.matrix.multiplyMatrices(scope.standingMatrix, scope.matrix);
            scope.matrixWorldNeedsUpdate = true;
            scope.visible = true;

            // タッチパッドの触れている位置
            this.axes[0] = gamepad.axes[0]//
            this.axes[1] = gamepad.axes[1];

            // タッチパッドのクリック
            this.thumbpadIsPressed = gamepad.buttons[0].pressed;

            // トリガー
            this.triggerIsPressed = gamepad.buttons[1].pressed;
            this.triggerValue = gamepad.buttons[1].value;
            
            // サイドにあるボタン
            this.sideButtonIsPressed = gamepad.buttons[3].pressed;

            // メニューボタン
            this.menuIsPressed = gamepad.buttons[3].pressed;
        }
    }

    // Export
    THREE.ViveController = ViveController;
    THREE.ViveController.prototype = Object.create(THREE.Object3D.prototype);
    THREE.ViveController.prototype.constructor = THREE.ViveController;

}(THREE));