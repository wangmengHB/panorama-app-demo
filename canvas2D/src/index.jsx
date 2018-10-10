
import React from 'react'
import ReactDOM from 'react-dom'
import PanoramicViewer from './component/PanoramicViewer'
import AnchorPoint from './component/PanoramicViewer/AnchorPoint'

import SAMPLE_1 from './sample_1.jpg'
import SAMPLE_2 from './sample_2.jpg'
import SAMPLE_3 from './sample_3.png'


const URL_2 = SAMPLE_2;
const URL_3 = SAMPLE_3;



const anchors = [
  new AnchorPoint(-180, 0, 'SOUTH', URL_2, [], renderPanorama),
  new AnchorPoint(-90, 0, 'WEST', URL_2, [], renderPanorama),
  new AnchorPoint(0, 0, 'NORTH', URL_3, [], renderPanorama),
  new AnchorPoint(90, 0, 'EAST', URL_3, [], renderPanorama),
]


renderPanorama(SAMPLE_2, anchors);


function renderPanorama (url, anchors = []) {
  const container = document.getElementById('app')
  ReactDOM.unmountComponentAtNode(container)
  ReactDOM.render(
    <PanoramicViewer
      imageUrl={url}
      fullscreen={true}
      anchors={anchors}
    />,
    container
  )
}





