<?php

require_once("../../php_incs/tasty_error.inc.php");
require_once("../../php_incs/db.inc.php");

$url = esc($_GET['profile_url']);
$query = <<< QUERY
SELECT * FROM `entreprise` WHERE `nom_profil` = '$url'
QUERY;

$result = runQuery($query);
$row = mysql_fetch_assoc($result);

$entrepriseName = $row['name'];
$postalCode = $row['postal_code'];
$nom_profil = $row['nom_profile'];
$rbqLicense = $row['license_rbq'];
$missionStatement = $row['mission_statement'];
$userId = $row['owner_id'];
$hourlyWage = $row['hourly_wage'];
$employeeCount = $row['nombre_employes'];
$yearsExperience = $row['years_experience'];
$speedRatio = $row['speed'];
$costRatio = $row['costs'];
$qualityRatio = $row['quality'];

$entrepriseId = 1;
$userId = 1;

$query = <<< QUERY
SELECT * FROM `user` WHERE `id` = '$userId'
QUERY;

$result = runQuery($query);
$row = mysql_fetch_assoc($result);

$email = $row['email'];
$firstName = $row['first_name'];
$lastName = $row['last_name'];
$cell = $row['cell'];
$facebookId = $row['facebook_id'];



// -================-
// ATOUTS

$query = <<< QUERY
SELECT `entreprise_atout`.`name` FROM `entreprise_atout_match` 
LEFT JOIN `entreprise_atout` ON `entreprise_atout`.`id` = `entreprise_atout_match`.`atout_id`
WHERE `entreprise_atout_match`.`entreprise_id` = '$entrepriseId'
QUERY;

$result = runQuery($query);
$atouts = array();
while($row = mysql_fetch_assoc($result))
	$atouts[] = $row['name'];


// -================-
// CATEGORIES

$query = <<< QUERY
SELECT `category`.`name` FROM `entreprise_category_match`
LEFT JOIN `category` ON `entreprise_category_match`.`category_id` = `category`.`id`
WHERE `entreprise_category_match`.`entreprise_id` = '$entrepriseId'
QUERY;

$result = runQuery($query);
$categories = array();
while($row = mysql_fetch_assoc($result))
	$categories[] = $row['name'];


// -================-
// METIERS

$query = <<< QUERY
SELECT `metier`.`name` FROM `entreprise_metier_match`
LEFT JOIN `metier` ON `entreprise_metier_match`.`metier_id` = `metier`.`id`
WHERE `entreprise_metier_match`.`entreprise_id` = '$entrepriseId'
QUERY;

$result = runQuery($query);
$metiers = array();
while($row = mysql_fetch_assoc($result))
	$metiers[] = $row['name'];


// -================-
// SECTEURS

$query = <<< QUERY
SELECT `secteur`.`name` FROM `entreprise_secteur_match`
LEFT JOIN `secteur` ON `entreprise_secteur_match`.`secteur_id` = `secteur`.`id`
WHERE `entreprise_secteur_match`.`entreprise_id` = '$entrepriseId'
QUERY;

$result = runQuery($query);
$secteurs = array();
while($row = mysql_fetch_assoc($result))
	$secteurs[] = $row['name'];


// -================-
// SPECIALTIES

$query = <<< QUERY
SELECT * FROM `entreprise_specialty` WHERE `entreprise_id` = '$entrepriseId'
QUERY;

$result = runQuery($query);
$specialties = array();
while($row = mysql_fetch_assoc($result))
  $specialties[] = $row['name'];


// -================-
// LOGOS

$query = <<< QUERY
SELECT * FROM `photo` WHERE `owner` = 'entreprise' AND `owner_id` = '$entrepriseId' AND `photo_type_id` = '7'
QUERY;

$result = runQuery($query);
$logos = array();
while($row = mysql_fetch_assoc($result))
	$logos[] = $row['url'];


// -================-
// THUMBNAILS

$query = <<< QUERY
SELECT * FROM `photo` WHERE `owner` = 'entreprise' AND `owner_id` = '$entrepriseId' AND `photo_type_id` = '1'
QUERY;

$result = runQuery($query);
$tns = array();
while($row = mysql_fetch_assoc($result))
	$tns[] = $row['url'];

?>
<!doctype html>
<!--[if lt IE 7]> <html class="ie6 oldie"> <![endif]-->
<!--[if IE 7]>    <html class="ie7 oldie"> <![endif]-->
<!--[if IE 8]>    <html class="ie8 oldie"> <![endif]-->
<!--[if gt IE 8]><!-->
<html class=""><!-- InstanceBegin template="/Templates/Header_client.dwt" codeOutsideHTMLIsLocked="false" -->
<!--<![endif]-->
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- InstanceBeginEditable name="doctitle" -->
<title>PROFIL_MODELE_14_MAI</title>
<!-- InstanceEndEditable -->
<link href="boilerplate.css" rel="stylesheet" type="text/css">
<link href="VraiPro_24grid.css" rel="stylesheet" type="text/css">
<!-- 
To learn more about the conditional comments around the html tags at the top of the file:
paulirish.com/2008/conditional-stylesheets-vs-css-hacks-answer-neither/

Do the following if you're using your customized build of modernizr (http://www.modernizr.com/):
* insert the link to your js here
* remove the link below to the html5shiv
* add the "no-js" class to the html tags at the top
* you can also remove the link to respond.min.js if you included the MQ Polyfill in your modernizr build 
-->
<!--[if lt IE 9]>
<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
<![endif]-->
<script src="respond.min.js"></script>
<!--The following script tag downloads a font from the Adobe Edge Web Fonts server for use within the web page. We recommend that you do not modify it.-->
<script>var __adobewebfontsappname__="dreamweaver"</script>
<script src="http://use.edgefonts.net/abel:n4:default;ubuntu:n4,n3:default;chivo:n4:default;shanti:n4:default;imprima:n4:default.js" type="text/javascript"></script>
<!-- InstanceBeginEditable name="head" -->
<!--TRACKING CODE POUR GOOGLE ANALYTICS-->
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-49246587-1', 'vraipro.ca');
  ga('send', 'pageview');

</script>

<!-- InstanceEndEditable -->
<!-- InstanceParam name="H_bouton_ajouter" type="boolean" value="true" -->
<!-- InstanceParam name="H_bouton_rechercher" type="boolean" value="true" -->
</head>
<body>

<!--MENU POUR MOBILE SEULEMENT-->

<nav class="fluid MB_menu_haut">
  <div class="fluid H_MB_bouton_retour">
    <a href="mobile_menu_principal.html"> 
    <img src="images/icones/icone_retour.png" alt=""/></a> </div>
	<!-- InstanceBeginEditable name="H_MB_bouton_specifique" -->
    <div class="fluid H_MB_wrapper_bouton_specifique">(bouton spécifiques à chaque page)</div>
	<!-- InstanceEndEditable --></nav>

<!--ENTETE POUR TABLETTE ET DESKTOP SEULEMENT-->

<header class="fluid header">

	<section class="fluid H_wrapper_haut_header">
		<section class="fluid H_mes_affaires">
				<div class="fluid HC_mes_pros">mes pros<div class="fluid HP_nb">2</div></div>
              <div class="fluid HC_mes_projets">mes projets<div class="fluid HP_nb"></div></div>
	   </section>
    <section class="fluid H_wrapper_logo">
    		<div class="fluid H_logo"><img src="images/Logo_VRAIPRO_600x257_sans_fond.png" alt=""/></div>
		</section>
        
        
		<section class="fluid HC_connexion_localite_etc">
			<div class="fluid HC_connexion">
				<a connexion_client href="connexion_client.html">
                <div class="fluid H_call_to_action_fb">Voyez les pros de vos amis!</div>
					<div class="fluid H_icone_fb">
  <img src="images/icones/icone_FB.png" alt=""/></div>
					<div id="H_texte_connexion" class="fluid">connexion</div>
               </a>
           </div>
           
           <div class="fluid H_Localite">
				<select name="HC_localite_select" required id="HC_localite_select">
  					<option>Localité</option>
  					<option>Sutton</option>
  					<option>Cowansville</option>
  					<option>Granby</option>
				</select>
			</div>
       </section>
      </section>
       
   <section class="fluid H_wrapper_bas_header">
   		<section class="fluid H_wrapper_ajouter">
	  		<div class="fluid H_ajouter">
    		  <div class="fluid H_icone_ajouter"><img src="images/icones/ajouter_icon.png" alt="" width="37"/></div>
	    		<div class="fluid H_texte_ajouter">Ajouter un projet </div>
	    	</div>
        </section>
        <div class="fluid H_espaceur_header_bas"></div>
        <section class="fluid H_wrapper_rechercher">
    		<div class="fluid H_rechercher">
      			<div class="fluid H_icone_rechercher"><img src="images/icones/rechercher_icon.png" alt=""/></div>
     			 <div class="fluid H_texte_rechercher">Rechercher des pros</div>
       	   </div>
        </section>
  		</section>
	</section>


</header>
<!-- InstanceBeginEditable name="Page_type_contenu" -->
<section class="fluid contenu">

<div class="fluid contenu">
<!--MENU MOBILE FIXE POUR PROFIL-->



<!--ENTETE DU PROFIL DE PRO-->
<section class="fluid PP_E">

	<div class="fluid PP_E_icone">
    
    </div>
    
    <section class="fluid PP_E_wrapper_bloc_gauche">
    
	  <div class="fluid PP_E_wrapper_nom_metier_localite">
    	<div class="fluid PP_E_nom_entr"><?= $entrepriseName?></div>
		<div class="fluid PP_E_metier"><?= join(", ", $categories) ?></div>
    	<div class="fluid PP_E_localite"><?= $postalCode ?></div>
      </div>
      
      
    </section>	

</section>
<!--FIN DE PROFIL DE PRO  ENTETE  PP_E-->

<!--CONNEXIONS SOCIALES-->

	

<!--LES 3 COLONNES DU PROFIL-->

	<!--OBJET IDENTITAIRE (OI)-->
<section class="fluid PP_colonne_identitaire">

	<section class="fluid PP_OI_photo_etc">
    	<div class="fluid PP_photo_profil"> 
    		<img src="<?= $tns[0] ?>" alt=""/> 
   		<div class="fluid PP_nom_photo_contact"><?= $firstName." ".$lastName ?></div></div>
    	<div class="fluid PP_mission_entr"><?= $missionStatement ?></div>
	</section>
    
	<section class="fluid PP_OI_atouts">
    
    	 <ul class="fluid fluidList PP_OI_liste_atouts">
         
       	   <li class="fluid PP_OI_element_liste_atout">
             	<div class="fluid PP_OI_icone_atout"><img src="images/icones/check.png" alt=""/></div> <div class="fluid PP_OI_texte_atout"><?= $yearsExperience ?> ans d'expérience</div>
           </li> 

<?php
	foreach($atouts as $atout)
	{
		?>	<li class="fluid PP_OI_element_liste_atout">
             	<div class="fluid PP_OI_icone_atout"><img src="images/icones/check.png" alt=""/></div> <div class="fluid PP_OI_texte_atout"><?= $atout ?></div>
           </li>
<?php	
	} 
?>         
         	<li class="fluid PP_OI_element_liste_atout">
             	<div class="fluid PP_OI_icone_atout"><img src="images/icones/check.png" alt=""/></div> <div class="fluid PP_OI_texte_atout">Licence RBQ (<?= $rbqLicense ?>)</div>
           </li>
         </ul> 
    </section>
<!--OI_SPÉCIALITÉS--> 
  <section class="fluid PP_OI_specialites">
    	<div class="fluid PP_OI_titre">Spécialités</div>
         <ul class="fluid fluidList PP_OI_specialite_liste">
          <?php 
          foreach($specialties as $specialty)
          { ?>

         		 <li class="fluid PP_OI_specialite_element_liste">
                <div class="fluid PP_OI_specialite_icone">
                	<img src="images/icones/thumbs_up_blanc.png" alt=""/></div>
                  <?= $specialty ?>
                </li>
          <?php } ?>                
         </ul> 
    </section>   
    
<!--SECTION FEEDBACK-->
<section class="fluid PP_OI_feedback">
	<div class="fluid PP_OI_titre">
    Témoignages
    </div>
	


</section>

   
<!--OI_AUTRES PHOTOS-->    
    <section class="fluid PP_OI_AP">
    	<div class="fluid PP_OI_titre">
        Autres photos
        </div>
      <div class="fluid PP_OI_AP_photo">
        photo
        </div>
      <div class="fluid PP_OI_AP_texte">
        Texte descriptif que l'usager peut ajouter (optionnel)</div>
    
      <div class="fluid PP_OI_AP_photo">
        photo
        </div>
        <div class="fluid PP_OI_AP_texte">
        Texte descriptif que l'usager peut ajouter (optionnel)</div>
        
        
    </section>
    
</section>




</section>

<div class="PP_BC">
 
<div class="PP_BC_recommandez">Recommander</div>
<div class="PP_BC_partagez">Partagez-lui votre projet!</div>

<div class="PP_BC_delai">temps de réponse:
  <div class="PP_BC_delai_seulement">45 min</div>
</div>
<!-- InstanceEndEditable -->
</div>
</body>
<!-- InstanceEnd --></html>