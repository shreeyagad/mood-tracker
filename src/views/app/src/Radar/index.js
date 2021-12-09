import { ResponsiveRadar } from '@nivo/radar';

let data = [
    {
      "taste": "fruity",
      "chardonay": 22,
      "carmenere": 105,
      "syrah": 51
    },
    {
      "taste": "bitter",
      "chardonay": 120,
      "carmenere": 75,
      "syrah": 39
    },
    {
      "taste": "heavy",
      "chardonay": 34,
      "carmenere": 31,
      "syrah": 32
    },
    {
      "taste": "strong",
      "chardonay": 101,
      "carmenere": 38,
      "syrah": 70
    },
    {
      "taste": "sunny",
      "chardonay": 84,
      "carmenere": 24,
      "syrah": 76
    }
  ]


const Radar = (props) => {
    return(
    <ResponsiveRadar
        data={props.data}
        keys={props.months}
        indexBy="emotion"
        valueFormat=">-.2f"
        margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
        borderColor={{ from: 'color' }}
        gridLabelOffset={36}
        dotSize={10}
        dotColor={{ theme: 'background' }}
        dotBorderWidth={2}
        colors={{ scheme: 'paired' }}
        blendMode="multiply"
        motionConfig="wobbly"
        legends={[
            {
                anchor: 'top-right',
                direction: 'column',
                translateX: -300,
                translateY: -40,
                itemWidth: 80,
                itemHeight: 25,
                itemTextColor: '#999',
                symbolSize: 15,
                symbolShape: 'circle',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemTextColor: '#000'
                        }
                    }
                ]
            }
        ]}
    />
    )}
export default Radar;