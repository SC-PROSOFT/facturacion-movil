package com.facturacion

// 1. AÑADE ESTAS IMPORTACIONES
import android.os.Bundle
import org.devio.rn.splashscreen.SplashScreen
// FIN DE LAS IMPORTACIONES AÑADIDAS

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  // 2. AÑADE ESTE MÉTODO COMPLETO
  /**
   * El método onCreate se llama cuando la actividad se está iniciando.
   * Es el lugar perfecto para mostrar nuestro splash screen.
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    SplashScreen.show(this) // Muestra el splash screen nativo
    super.onCreate(savedInstanceState) // Llama al método original después
  }
  // FIN DEL MÉTODO AÑADIDO

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "Facturacion"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}